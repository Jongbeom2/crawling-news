const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const { Document, Packer, Paragraph } = require("docx");

const urlList = [""];

const getHtml = async (url) => {
  try {
    return await axios.get(url);
  } catch (error) {
    console.error(error);
  }
};

for (let i = 0; i < urlList.length; i++) {
  getHtml(urlList[i])
    .then((html) => {
      let str = urlList[i] + "\n" + "\n";
      const $ = cheerio.load(html.data);
      const name = $("div .page-title-wrapper span").text();
      str += name + "\n";
      const description = $("div .description>div>p").text();
      str += description + "\n";
      const itemList = $("div.data.item.content");

      itemList.each(function (i, elem) {
        str += $(this).text();
      });

      return { name, str };
    })
    .then((res) => {
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
        const newName = res.name
          .replace("/", "")
          .replace("\\", "")
          .replace(":", "")
          .replace("?", "")
          .replace("<", "")
          .replace(">", "")
          .replace("|", "");
        fs.writeFileSync(`HC_${newName}_EN.docx`, buffer);
      });
    });
}
