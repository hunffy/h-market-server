const express = require("express");
const cors = require("cors");
const app = express();
const models = require("./models");
const port = process.env.PORT || 8080;
const multer = require("multer");

//이미지 파일을 저장할 장소
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

app.use(express.json());
app.use(cors());

//파일을 실제로 업로드할때 경로를 설정해주는 부분
app.use("/uploads/", express.static("uploads"));

//이미지 업로드 api
//single('키값') : 하나의 이미지 업로드처리 이미지 키값을 넣어줘야한다. 여기서는 'image'가 키값
app.post("/image", upload.single("image"), (req, res) => {
  const file = req.file;
  console.log(file);
  res.send({
    imageUrl: file.path,
  });
});

//모든 상품 조회 Api
app.get("/products", (req, res) => {
  models.Product.findAll({
    //limit : 조회되는 데이터 수를 설정
    //order : 정렬순서
    //attribute : 필요한 컬럼만 가져오게해준다.
    order: [["createdAt", "DESC"]],
    attributes: [
      "id",
      "name",
      "price",
      "createdAt",
      "seller",
      "imageUrl",
      "soldout",
    ],
  })
    .then((result) => {
      console.log("PRODUCT 조회 : ", result);
      res.send({
        products: result,
      });
    })
    .catch((error) => {
      console.log("error :", error);
      res.status(400).send("에러발생");
    });
});

//상품 생성 Api
app.post("/products", (req, res) => {
  const body = req.body;
  const { name, description, price, seller, imageUrl } = body;
  if (!name || !description || !price || !seller || !imageUrl) {
    res.status(400).send("모든 필드를 입력해 주세요");
  }
  models.Product.create({
    name: name,
    description: description,
    price: price,
    seller: seller,
    imageUrl: imageUrl,
  })
    .then((result) => {
      console.log("상품생성 결과 : ", result);
      res.send({ result: result });
    })
    .catch((error) => {
      console.log("error :", error);
      res.status(400).send("상품 업로드에 문제가 발생했습니다.");
    });
});

app.listen(port, () => {
  console.log("서버가 구동중입니다.");
  models.sequelize
    .sync()
    .then(() => {
      console.log("DB연결 성공");
    })
    .catch((err) => {
      console.log("error :", err);
      console.log("DB연결 에러");
      process.exit();
    });
});

//상품상세 조회 api
app.get("/products/:id", (req, res) => {
  const params = req.params;
  const { id } = params;
  models.Product.findOne({
    where: {
      id: id,
    },
  })
    .then((result) => {
      console.log("PRODUCT :", result);
      res.send({
        product: result,
      });
    })
    .catch((error) => {
      console.log("error : ", error);
      res.status(400).send("상품 조회에 에러가 발생했습니다.");
    });
});

//삭제 api
app.delete("/products/:id", (req, res) => {
  const params = req.params;
  const { id } = params;
  models.Product.destroy({
    where: {
      id: id,
    },
  })
    .then((result) => {
      console.log("삭제성공", result);
      res.send({
        message: `ID : ${id}의 게시물이 삭제되었습니다.`,
      });
    })
    .catch((error) => {
      console.log("에러발생 : ", error);
      res.status(400).send("삭제 중 에러가 발생했습니다.");
    });
});

//배너 api

app.get("/banners", (req, res) => {
  models.Banner.findAll({
    limit: 2,
  })
    .then((result) => {
      res.send({
        banners: result,
      });
    })
    .catch((error) => {
      console.log("error :", error);
      res.status(500).send("에러가 발생했습니다.");
    });
});

// 결제하기 api

app.post("/purchase/:id", (req, res) => {
  const params = req.params;
  const { id } = params;
  models.Product.update(
    {
      soldout: 1,
    },
    {
      where: {
        id: id,
      },
    }
  )
    .then((result) => {
      res.send({
        result: true,
      });
    })
    .catch((error) => {
      console.log("error : ", error);
      res.status(500).send("에러가 발생했습니다.");
    });
});
