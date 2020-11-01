const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const { Document, Packer, Paragraph } = require("docx");

const urlList = [
  "https://www.christiantoday.co.kr/news/335643",
  // "https://www.christiantoday.co.kr/news/335631",
  // "https://www.christiantoday.co.kr/news/335630",
  // "https://www.christiantoday.co.kr/news/335629",
  // "https://www.christiantoday.co.kr/news/335638",
  // "https://www.christiantoday.co.kr/news/335592",
  // "https://www.christiantoday.co.kr/news/335570",
  // "https://www.christiantoday.co.kr/news/335546",
  // "https://www.christiantoday.co.kr/news/335531",
  // "https://www.christiantoday.co.kr/news/335471",
  // "https://www.christiantoday.co.kr/news/335483",
  // "https://www.christiantoday.co.kr/news/335634",
  // "https://www.christiantoday.co.kr/news/335607",
  // "https://www.christiantoday.co.kr/news/335609",
  // "https://www.christiantoday.co.kr/news/335605",
];

const getHtml = async (url) => {
  try {
    return await axios.get(url);
  } catch (error) {
    console.error(error);
  }
};

const createDoc = (res) => {
  const doc = new Document();
  const docChildList = [];
  const strList = res.str.split("\n");
  for (let i = 0; i < strList.length; i++) {
    docChildList.push(
      new Paragraph({
        text: strList[i],
      })
    );
  }
  doc.addSection({
    children: docChildList,
  });
  Packer.toBuffer(doc).then((buffer) => {
    const newTitle = res.title
      .replace("/", "")
      .replace("\\", "")
      .replace(":", "")
      .replace("?", "")
      .replace("<", "")
      .replace(">", "")
      .replace("|", "");
    fs.writeFileSync(`${newTitle}_EN.docx`, buffer);
  });
};

for (let i = 0; i < urlList.length; i++) {
  getHtml(urlList[i])
    .then((html) => {
      let str = urlList[i] + "\n\n";
      const $ = cheerio.load(html.data);
      const title = $("header.article-header .col-sm-8 h1").text();
      const date = $("header.article-header time")
        .text()
        .split(":")[1]
        .split(" ")[1];
      const subTitle = $("article h4").text();
      str += title + "\n\n";
      str += subTitle + "\n";
      const itemList = $("article .article-body p");

      itemList.each(function (i, elem) {
        // console.log($(this))
        str += $(this).text() + "\n";
      });

      return { title, date, str };
    })
    .then((res) => {
      console.log(res);
      // createDoc(res);
    });
}
