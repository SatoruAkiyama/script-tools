// node json-to-csv.js .\personal-website\profile\en.json  ./profile-en.tsv
// node json-to-csv.js .\personal-website\job-experience\en.json  ./job-exp-en.tsv
// node json-to-csv.js .\personal-website\contact\en.json  ./contact-en.tsv
// node json-to-csv.js .\personal-website\comments\en.json  ./comments-en.tsv

const fs = require('fs');

function flatten(obj, prefix = '') {
  let result = {};
  for (const key in obj) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value, fullKey));
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === 'object') {
          Object.assign(result, flatten(item, `${fullKey}.${i}`));
        } else {
          result[`${fullKey}.${i}`] = item;
        }
      });
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('使い方: node script.js 入力ファイル.json 出力ファイル.tsv');
  process.exit(1);
}

const inputPath = args[0];
const outputPath = args[1];

// UTF-8でJSON読み込み
const jsonStr = fs.readFileSync(inputPath, 'utf8');
const jsonData = JSON.parse(jsonStr);

const flat = flatten(jsonData);

const rows = [['key', 'value']];
for (const [k, v] of Object.entries(flat)) {
  rows.push([k, v]);
}

// TSV形式作成（値の中に特殊文字があっても対応）
const tsv = rows
  .map(row =>
    row
      .map(field => {
        const str = String(field);
        if (str.includes('\t') || str.includes('\n') || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join('\t')
  )
  .join('\n');

// UTF-8でファイル書き込み
fs.writeFileSync(outputPath, tsv, 'utf8');
console.log(`変換完了！ファイルを保存しました: ${outputPath}`);
