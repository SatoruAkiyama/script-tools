// node extract-json-value.js .\personal-website\profile\de.json  ./profile-de-val.tsv
// node extract-json-value.js .\personal-website\job-experience\de.json  ./job-exp-de-val.tsv
// node extract-json-value.js .\personal-website\contact\de.json  ./contact-de-val.tsv
// node extract-json-value.js .\personal-website\comments\de.json  ./comments-de-val.tsv

const fs = require('fs');

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error('使い方: node script.js 入力.json 出力.tsv');
  process.exit(1);
}

const json = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

function flatten(obj, prefix = '') {
  let res = {};
  for (const k in obj) {
    const val = obj[k];
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      Object.assign(res, flatten(val, key));
    } else if (Array.isArray(val)) {
      val.forEach((item, i) => {
        if (typeof item === 'object') Object.assign(res, flatten(item, `${key}.${i}`));
        else res[`${key}.${i}`] = item;
      });
    } else {
      res[key] = val;
    }
  }
  return res;
}

const flat = flatten(json);
const values = Object.values(flat);

const output = values
  .map(v => {
    const s = String(v);
    if (s.includes('\t') || s.includes('\n') || s.includes('"')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  })
  .join('\n');

fs.writeFileSync(outputPath, output, 'utf8');
console.log(`値のみを1列に抽出しました: ${outputPath}`);
