const mix = require('laravel-mix');
const connectSSI = require('connect-ssi');
const glob = require('glob');

/*
* ----------------------------------------------------------------------------------
* Config（webpack.mix.jsからの相対パスで各ディレクトリまでのパスを設定）
* ----------------------------------------------------------------------------------
*/

const PATHS = {
  projectRoot: 'docs/',//ドキュメントルート
  sassCommon: '_dev/scss/siteCommon/',//サイト全体の.scss格納先
  sassUnique: '_dev/scss/siteUnique/',//ページ固有の.scss格納先
  cssCommon: 'docs/share/css',//サイト全体の共通cssコンパイル先
  searchSass: '/scss'//ページ固有のファイルパスを取得する際に使用（基本編集の必要なし）
};

/*
* ----------------------------------------------------------------------------------
* Sass（サイト全体の共通スタイル）
* ----------------------------------------------------------------------------------
*/
glob.sync(`${PATHS.sassCommon}**/*.scss`,
{ignore: `${PATHS.sassCommon}**/_*.scss`}).map(function (file) {
  mix
    .sass(file, PATHS.cssCommon,{
      sassOptions: {
        outputStyle: 'expanded'
      }
    })
    .options({
      processCssUrls: false,
      postCss: [
        require('css-mqpacker')(),
        require('css-declaration-sorter')({
          order: 'smacss'
        })
      ]
    })
})

/*
* ----------------------------------------------------------------------------------
* Sass（ページ固有のスタイル）
* ----------------------------------------------------------------------------------
*/
glob.sync(`${PATHS.sassUnique}**/*.scss`,
{ignore: `${PATHS.sassUnique}**/_*.scss`}).map(function (file) {

  //ファイルパスから/scssの位置を検索
  const index = file.indexOf(PATHS.searchSass);

  //基準文字列から後の文字列を切り出し
  const dir = file.slice(index + 1);
  const dirPath = dir.split("/").reverse().slice(1).reverse().join("/");
  const cssPath = dirPath.replace('scss/siteUnique', '');

  mix
    .sass(file, PATHS.projectRoot + cssPath,{
      sassOptions: {
        outputStyle: 'expanded'
      }
    })
    .options({
      processCssUrls: false,
      postCss: [
        require('css-mqpacker')(),
        require('css-declaration-sorter')({
          order: 'smacss'
        })
      ]
    })
})

/*
* ----------------------------------------------------------------------------------
* Live Reload
* ----------------------------------------------------------------------------------
*/
mix
.browserSync({
  files: ['docs/*','_dev/scss/**/*.scss'],
  "server": {
    baseDir: "docs/",
    middleware: [
      connectSSI({
        baseDir: __dirname + '/docs',
        ext: '.html'
      })
    ]
  },
  proxy: false
});