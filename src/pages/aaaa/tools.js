let { writeFile, readFile, readdir, writeFileSync } = require("fs");
const iconv = require("iconv-lite");
const chalk = require("chalk");

const getComponents = () =>{
  console.log("我是脚本")
}
module.exports.getComponents = getComponents;
