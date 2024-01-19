const tf = require("@tensorflow/tfjs-node");
const mobilenet = require("@tensorflow-models/mobilenet");
const fs = require("fs");

module.exports = function detectProduct(url, callback) {
  //fs.readFileSync파일을 동기적으로 불러오겠다 이미지를 불러오는 부분
  const image = fs.readFileSync(url);

  //image를 tensor형태로 바꿔줘야한다.
  const input = tf.node.decodeImage(image, 3);

  //가공된 데이터 load
  mobilenet
    .load()
    .then((model) => {
      //classify() =>안에 들어온 데이터 무슨사물인지 분석.
      model
        .classify(input)
        .then((result) => {
          callback(result[0].className);
        })
        .catch((error) => {
          console.log("classify 중 오류 :", error);
        });
    })
    .catch((error) => {
      console.log("error :", error);
    });
};
