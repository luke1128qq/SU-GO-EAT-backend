const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const db = require(__dirname + '/../modules/mysql2');
const dayjs = require('dayjs');
// const upload = require(__dirname + '/../modules/res-img-upload')
const resUploadImg = require(__dirname + '/../modules/shop-img-upload')
const resMultipartParser = resUploadImg.none()
const nodemailer = require("nodemailer");
const foodItemUploadImg = require(__dirname + '/../modules/res-img-upload')
const foodItemMultipartParser = foodItemUploadImg.none()
const bcrypt = require('bcryptjs')
const transporter = require(__dirname + '/../modules/config.js').transporter

// 將html與api分開

const getListData = async (req, shop_id) => {
    let output = {
        redirect: "",
        totalRows: 0,
        perPage: 5,
        totalPages: 0,
        page: 1,
        rows: [],
    }

    const perPage = 5;

    // 在哪一個分頁(?page=...) => 用req.query
    let page = req.query.page ? +req.query.page : 1;
    //console.log('---page---')
    //console.log(page)
    //console.log('---page---')

    //console.log('---shop_id---')
    //console.log(req.query.shop_id)
    //console.log('---shop_id---')

    // 做搜尋功能:用queryString做
    let keyword = req.query.keyword || '';
    //console.log('---keyword---')
    //console.log(keyword)
    //console.log('---keyword---')
    // 防範如果page是NaN或0會回傳true
    const baseUrl = req.baseUrl
    if (!page || page < 1) {
        // 小於1或NaN、0時就導回到/ab
        output.redirect = req.baseUrl
        return output   // 不能用'/',會回到整個網站的根目錄，要用baseUrl
    }

    // 以sql語法做關鍵字搜尋，先做出篩選條件
    // let where = `WHERE 1`;
    let where = `WHERE shop_id=${shop_id}`;
    if (keyword) {
        const kw_escaped = db.escape('%' + keyword + '%');
        where += ` AND ( 
          \`food_title\` LIKE ${kw_escaped} 
          OR
          \`food_des\` LIKE ${kw_escaped}
          )
        `;
    }
    // where += ` AND \`name\` LIKE ${ db.escape('%'+keyword+'%') } `;
    // 未跳脫前:where += ` AND \`name\` LIKE '%${keyword}%' `
    // 先看資料庫共有幾筆資料
    const t_sql = `SELECT COUNT(1) totalRows FROM food_items ${where}`
    const [[{ totalRows }]] = await db.query(t_sql);    // 解構三次

    //console.log('---totalRows---')
    //console.log(totalRows)
    //console.log('---totalRows---')

    let totalPages = 0;
    // 計算有多少頁(假設總筆數totalRows不為0)
    if (totalRows) {
        totalPages = Math.ceil(totalRows / perPage)

        if (page > totalPages) {
            output.redirect = req.baseUrl + '?page=' + totalPages
            return output
        }
    }
    //console.log('---totalPages---')
    //console.log(totalPages)
    //console.log('---totalPages---')
    let rows = [];
    // 拿分頁的資料
    const sql = `SELECT * FROM food_items ${where} ORDER BY food_id DESC LIMIT ${perPage * (page - 1)}, ${perPage}`;
    [rows] = await db.query(sql)
    // const [rows] = await db.query(sql) 也可以

    output = { ...output, totalRows, perPage, totalPages, page, baseUrl, keyword, rows }
    return output
}

const getAllListData = async (req, shop_id) => {

    let output = {
        redirect: "",
        totalRows: 0,
        perPage: 5,
        totalPages: 0,
        page: 1,
        rows: [],
    }

    const perPage = 100;

    // 在哪一個分頁(?page=...) => 用req.query
    let page = req.query.page ? +req.query.page : 1;
    //console.log('---page---')
    //console.log(page)
    //console.log('---page---')

    //console.log('---shop_id---')
    //console.log(req.query.shop_id)
    //console.log('---shop_id---')

    // 做搜尋功能:用queryString做
    let keyword = req.query.keyword || '';
    //console.log('---keyword---')
    //console.log(keyword)
    //console.log('---keyword---')
    // 防範如果page是NaN或0會回傳true
    const baseUrl = req.baseUrl
    if (!page || page < 1) {
        // 小於1或NaN、0時就導回到/ab
        output.redirect = req.baseUrl
        return output   // 不能用'/',會回到整個網站的根目錄，要用baseUrl
    }

    // 以sql語法做關鍵字搜尋，先做出篩選條件
    // let where = `WHERE 1`;
    let where = `WHERE shop_id=${shop_id}`;
    if (keyword) {
        const kw_escaped = db.escape('%' + keyword + '%');
        where += ` AND ( 
          \`food_title\` LIKE ${kw_escaped} 
          OR
          \`food_des\` LIKE ${kw_escaped}
          )
        `;
    }

    // 先看資料庫共有幾筆資料
    const t_sql = `SELECT COUNT(1) totalRows FROM food_items ${where}`
    const [[{ totalRows }]] = await db.query(t_sql);    // 解構三次

    //console.log('---totalRows---')
    //console.log(totalRows)
    //console.log('---totalRows---')

    let totalPages = 0;
    // 計算有多少頁(假設總筆數totalRows不為0)
    if (totalRows) {
        totalPages = Math.ceil(totalRows / perPage)

        if (page > totalPages) {
            output.redirect = req.baseUrl + '?page=' + totalPages
            return output
        }
    }
    //console.log('---totalPages---')
    //console.log(totalPages)
    //console.log('---totalPages---')
    let rows = [];
    // 拿分頁的資料
    const sql = `SELECT * FROM food_items ${where} ORDER BY food_id DESC LIMIT ${perPage * (page - 1)}, ${perPage}`;
    [rows] = await db.query(sql)
    // const [rows] = await db.query(sql) 也可以

    output = { ...output, totalRows, perPage, totalPages, page, baseUrl, keyword, rows }
    return output
}

const getListDataASC = async (req, shop_id) => {

    let output = {
        redirect: "",
        totalRows: 0,
        perPage: 25,
        totalPages: 0,
        page: 1,
        rows: [],
    }

    const perPage = 50;

    // 在哪一個分頁(?page=...) => 用req.query
    let page = req.query.page ? +req.query.page : 1;

    // 做搜尋功能:用queryString做
    let keyword = req.query.keyword || '';

    // 防範如果page是NaN或0會回傳true
    const baseUrl = req.baseUrl
    if (!page || page < 1) {               // 小於1或NaN、0時就導回到/ab
        output.redirect = req.baseUrl
        return output   // 不能用'/',會回到整個網站的根目錄，要用baseUrl
    }

    // 以sql語法做關鍵字搜尋，先做出篩選條件
    // let where = `WHERE 1`;
    let where = `WHERE shop_id=${shop_id}`;
    if (keyword) {
        const kw_escaped = db.escape('%' + keyword + '%');
        where += ` AND ( 
          \`food_title\` LIKE ${kw_escaped} 
          OR
          \`food_des\` LIKE ${kw_escaped}
          )
        `;
    }
    // where += ` AND \`name\` LIKE ${ db.escape('%'+keyword+'%') } `;
    // 未跳脫前:where += ` AND \`name\` LIKE '%${keyword}%' `

    // 先看資料庫共有幾筆資料
    const t_sql = `SELECT COUNT(1) totalRows FROM food_items ${where}`
    const [[{ totalRows }]] = await db.query(t_sql);    // 解構三次

    let totalPages = 0;
    // 計算有多少頁(假設總筆數totalRows不為0)
    if (totalRows) {
        totalPages = Math.ceil(totalRows / perPage)

        if (page > totalPages) {
            output.redirect = req.baseUrl + '?page=' + totalPages
            return output
        }
    }

    let rows = [];
    // 拿分頁的資料
    const sql = `SELECT * FROM food_items ${where} ORDER BY food_id ASC LIMIT ${perPage * (page - 1)}, ${perPage}`;
    [rows] = await db.query(sql)
    // const [rows] = await db.query(sql) 也可以

    output = { ...output, totalRows, perPage, totalPages, page, baseUrl, keyword, rows }
    return output
}

// previewResImg 這是餐廳照片Ajax的東西
router.post("/shopPreviewImg", resUploadImg.single("preImg"), async (req, res) => {
    // const filename = req.file.filename
    res.json(req.file);
    //console.log(req.file);
});

router.post("/foodItemPreviewImg", foodItemUploadImg.single("preImg"), async (req, res) => {
    // const filename = req.file.filename
    res.json(req.file);
    //console.log(req.file);
});


// 寄送驗證信件
// const transporter = nodemailer.createTransport({
//     host: "smtp.forwardemail.net",
//     port: 465,
//     secure: true,
//     auth: {
//       // TODO: replace `user` and `pass` values from <https://forwardemail.net>
//       user: process.env.SMTP_TO_EMAIL,
//       pass: process.env.SMTP_TO_PASSWORD,
//     }
//   });

router.get('/send', (req, res) => {
    // mail content
    const mailOptions = {
        from: `"Norm"<${process.env.SMTP_TO_EMAIL}>`,
        to: `mouse19961130@proton.me`,
        subject: 'A test email',
        text: '這是一封測試信件'
    }
    //Send Email
    transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
            return res.status(400).send({ Status: 'Failure', Details: err })
        } else {
            return res.send({ Status: 'Success' })
        }
    })
    // res.json(mailOptions)
})

// 商家註冊發送驗證信
router.post('/sendVerifyCode', async (req, res) => {
    const output = {
        success: false,
        error: '',
        data: '',
        matchCode: '',
    }
    if (!req.body.account) {
        output.error = '你沒有填入帳號!'
        return res.json(output)
    }

    // mail content
    const emailLocation = req.body.account
    const verifyCode = String(Math.floor(Math.random() * 1000000)).padEnd(6, '0') //生成6位數隨機驗證碼
    const matchCode = String(Math.floor(Math.random() * 1000000)).padEnd(8, '0')  //生成8位數對照碼(傳到前端跟DB，以方便對照是哪組驗證碼)

    const mailOptions = {
        from: `"食 GO EAT"<${process.env.SMTP_TO_EMAIL}>`,
        to: `${emailLocation}`,
        subject: '註冊食 GO EAT的驗證碼',
        text: `您好，您註冊食 GO EAT的驗證碼為:${verifyCode},\n請於60秒內輸入驗證碼`
    }
    //Send Email
    transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
            return res.status(400).send({ Status: 'Failure', Details: err })
        } else {
            return res.send({ Status: 'Success' })
        }
    })

    // 寫入後端資料庫
    const sql = "INSERT INTO `otp`(`matchCode`, `otp_code`, `created_at`) VALUES (?,?,NOW())"
    const [result] = await db.query(sql, [matchCode, verifyCode])
    //console.log(result)
    output.data = result
    output.success = true
    output.matchCode = matchCode

    res.json(output)
    // res.json(mailOptions)
})

// 商家註冊跟資料庫對比六位數密碼
router.post('/checkVerifyCode', async (req, res) => {
    const output = {
        success: false,
        message: '',
        error: '',
        data: null,
    }

    const matchCode = req.body.matchCode
    const sixDigitCode = req.body.sixDigitCode

    if (sixDigitCode.length = "") {
        output.error = '沒有填入驗證碼!'
        res.json(output)
    }

    // 先對照有沒有matchCode的資料
    const matchSQL = "SELECT * FROM `otp` WHERE matchCode=?"
    const [result] = await db.query(matchSQL, [matchCode])
    //console.log(result)
    // [
    //     {
    //       id: 18,
    //       matchCode: 78902100,
    //       otp_code: '186048',
    //       created_at: 2023-08-03T07:46:14.000Z
    //     }
    //   ]

    // 拿到資料後去對比sixDigitCode
    if (sixDigitCode == result[0].otp_code) {
        output.message = '驗證碼正確!';
        output.success = true;
        return res.json(output)
    } else {
        output.message = '驗證碼不正確!';
        return res.json(output)
    }

    res.json(req.body)
})

// 商家註冊表單
router.post('/res-register-form/', resMultipartParser, async (req, res) => {
    // res.send(req.params)

    const output = {
        success: false,
        error: '',
        data: null,
    };

    let city = ''
    if (req.body.city == '台北市') {
        city = 1
    } else if (req.body.city == '新北市') {
        city = 2
    } else if (req.body.city == '基隆市') {
        city = 3
    }

    let res_cate;
    if (req.body.res_cate == '中式') {
        res_cate = 1
    } else if (req.body.res_cate == '西式') {
        res_cate = 2
    } else if (req.body.res_cate == '日式') {
        res_cate = 3
    } else if (req.body.res_cate == '韓式') {
        res_cate = 4
    } else if (req.body.res_cate == '美式') {
        res_cate = 5
    } else if (req.body.res_cate == '泰式') {
        res_cate = 6
    }

    let area = ''
    if (req.body.city == '台北市' && req.body.area == '中正區') {
        area = 0
    } else if (req.body.city == '台北市' && req.body.area == '大同區') {
        area = 1
    } else if (req.body.city == '台北市' && req.body.area == '中山區') {
        area = 2
    } else if (req.body.city == '台北市' && req.body.area == '松山區') {
        area = 3
    } else if (req.body.city == '台北市' && req.body.area == '大安區') {
        area = 4
    } else if (req.body.city == '台北市' && req.body.area == '萬華區') {
        area = 5
    } else if (req.body.city == '台北市' && req.body.area == '信義區') {
        area = 6
    } else if (req.body.city == '台北市' && req.body.area == '士林區') {
        area = 7
    } else if (req.body.city == '台北市' && req.body.area == '北投區') {
        area = 8
    } else if (req.body.city == '台北市' && req.body.area == '內湖區') {
        area = 9
    } else if (req.body.city == '台北市' && req.body.area == '南港區') {
        area = 10
    } else if (req.body.city == '台北市' && req.body.area == '文山區') {
        area = 11
    } else if (req.body.city == '新北市' && req.body.area == '萬里區') {
        area = 0
    } else if (req.body.city == '新北市' && req.body.area == '金山區') {
        area = 1
    } else if (req.body.city == '新北市' && req.body.area == '板橋區') {
        area = 2
    } else if (req.body.city == '新北市' && req.body.area == '汐止區') {
        area = 3
    } else if (req.body.city == '新北市' && req.body.area == '深坑區') {
        area = 4
    } else if (req.body.city == '新北市' && req.body.area == '石碇區') {
        area = 5
    } else if (req.body.city == '新北市' && req.body.area == '瑞芳區') {
        area = 6
    } else if (req.body.city == '新北市' && req.body.area == '平溪區') {
        area = 7
    } else if (req.body.city == '新北市' && req.body.area == '雙溪區') {
        area = 8
    } else if (req.body.city == '新北市' && req.body.area == '貢寮區') {
        area = 9
    } else if (req.body.city == '新北市' && req.body.area == '新店區') {
        area = 10
    } else if (req.body.city == '新北市' && req.body.area == '坪林區') {
        area = 11
    } else if (req.body.city == '新北市' && req.body.area == '烏來區') {
        area = 12
    } else if (req.body.city == '新北市' && req.body.area == '永和區') {
        area = 13
    } else if (req.body.city == '新北市' && req.body.area == '中和區') {
        area = 14
    } else if (req.body.city == '新北市' && req.body.area == '土城區') {
        area = 15
    } else if (req.body.city == '新北市' && req.body.area == '三峽區') {
        area = 16
    } else if (req.body.city == '新北市' && req.body.area == '樹林區') {
        area = 17
    } else if (req.body.city == '新北市' && req.body.area == '鶯歌區') {
        area = 18
    } else if (req.body.city == '新北市' && req.body.area == '三重區') {
        area = 19
    } else if (req.body.city == '新北市' && req.body.area == '新莊區') {
        area = 20
    } else if (req.body.city == '新北市' && req.body.area == '泰山區') {
        area = 21
    } else if (req.body.city == '新北市' && req.body.area == '林口區') {
        area = 22
    } else if (req.body.city == '新北市' && req.body.area == '蘆洲區') {
        area = 23
    } else if (req.body.city == '新北市' && req.body.area == '五股區') {
        area = 24
    } else if (req.body.city == '新北市' && req.body.area == '八里區') {
        area = 25
    } else if (req.body.city == '新北市' && req.body.area == '淡水區') {
        area = 26
    } else if (req.body.city == '新北市' && req.body.area == '三芝區') {
        area = 27
    } else if (req.body.city == '新北市' && req.body.area == '石門區') {
        area = 28
    } else if (req.body.city == '基隆市' && req.body.area == '仁愛區') {
        area = 0
    } else if (req.body.city == '基隆市' && req.body.area == '信義區') {
        area = 1
    } else if (req.body.city == '基隆市' && req.body.area == '中正區') {
        area = 2
    } else if (req.body.city == '基隆市' && req.body.area == '中山區') {
        area = 3
    } else if (req.body.city == '基隆市' && req.body.area == '安樂區') {
        area = 4
    } else if (req.body.city == '基隆市' && req.body.area == '暖暖區') {
        area = 5
    } else if (req.body.city == '基隆市' && req.body.area == '七堵區') {
        area = 6
    }

    const salt = bcrypt.genSaltSync(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    // 判斷營業日期
    const openTimeArray = [0, 0, 0, 0, 0, 0, 0,]
    const openDays = req.body.open_days // array
    for (let openday of openDays) {
        if (openday == '星期一') {
            openTimeArray[0] = 1
        } else if (openday == '星期二') {
            openTimeArray[1] = 1
        } else if (openday == '星期三') {
            openTimeArray[2] = 1
        } else if (openday == '星期四') {
            openTimeArray[3] = 1
        } else if (openday == '星期五') {
            openTimeArray[4] = 1
        } else if (openday == '星期六') {
            openTimeArray[5] = 1
        } else if (openday == '星期日') {
            openTimeArray[6] = 1
        }
    }

    const sql_shop =
        "INSERT INTO `shops`" +
        "(`account`, `password`, `shop`, `owner`,`category`," +
        "`res_desc`,`avg_consumption`, `photo`, `removeBackgroundImage`, `city`, `area`," +
        " `location`, `phone`, `longitude`, `latitude`)" +
        "VALUES" +
        " (?,?,?,?,?," +
        "?,?,?,NULL,?,?," +
        "?,?,?,?); ";

    const sql_opentime =
        "INSERT INTO `res_opentime`" +
        "(`res_id`, `open_time`, `close_time`, `Monday`, `Tuesday`," +
        " `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday`)" +
        "VALUES" +
        "(?,?,?,?,?,?,?,?,?,?)";

    const conn = await db.getConnection();
    try {
        // Start transaction
        await conn.beginTransaction();

        // Insert into `shops` table
        const [result_shop] = await conn.query(sql_shop, [
            req.body.account,
            hashPassword,
            req.body.shopname,
            req.body.owner,
            res_cate,
            req.body.description,
            req.body.avg_consumption,
            req.body.photo,
            city,
            area,
            req.body.fulladdress1,
            req.body.phone,
            req.body.longitude,
            req.body.latitude
        ]);

        const res_id = result_shop.insertId;

        const [result_opentime] = await conn.query(sql_opentime, [
            res_id,
            req.body.open_time,
            req.body.close_time,
            openTimeArray[0],
            openTimeArray[1],
            openTimeArray[2],
            openTimeArray[3],
            openTimeArray[4],
            openTimeArray[5],
            openTimeArray[6],
        ]);

        // Commit the transaction
        await conn.commit();

        res.json({
            result_shop,
            result_opentime,
        });
    } catch (err) {
        // Rollback the transaction on error
        await conn.rollback();
        // Handle any errors
        //console.error(err);
        res.status(500).json({
            success: false,
            error: 'An error occurred.',
        });
    } finally {
        // Release the connection
        conn.release();
    }
});

// router.post('/registerData',async(req,res) => {
//     const sql = "SELECT `sid`, `account`, `shop`,  `photo`  FROM `shops` WHERE shop=?"
//     const [row] = await db.query(sql,[req.body.shop])
//     res.json(row)
// })


// 餐廳新增商品
router.post('/add-item', foodItemMultipartParser, async (req, res) => {

    let foodCate = 0
    if (req.body.foodCate === '開胃菜') {
        foodCate = 1
    } else if (req.body.foodCate === '主餐') {
        foodCate = 2
    } else if (req.body.foodCate === '甜點') {
        foodCate = 3
    } else if (req.body.foodCate === '飲料') {
        foodCate = 4
    } else if (req.body.foodCate === '湯品') {
        foodCate = 5
    }

    const sql = "INSERT INTO `food_items`(`shop_id`, `food_img`, `food_cate`, `food_title`, `food_des`, `food_price`, `food_note`, `create_time`) VALUES (?,?,?,?,?,?,?,NOW())"

    const [result] = await db.query(sql, [
        req.body.shop_id,
        req.body.photo,
        foodCate,
        req.body.name,
        req.body.description,
        req.body.price,
        req.body.note,
    ])

    res.json({
        result,
        postData: req.body
    })
})

// 取得品項資料
router.post('/item-management', async (req, res) => {
    // res.json(req.body)

    const output = await getListData(req, req.body.id);
    if (output.redirect) {
        return res.redirect(output.redirect)
    }

    output.rows.forEach(i => {
        i.create_time = dayjs(i.create_time).format('YYYY-MM-DD HH:mm:ss')
        if (i.food_cate == 1) {
            i.food_cate = '開胃菜'
        } else if (i.food_cate == 2) {
            i.food_cate = '主餐'
        } else if (i.food_cate == 3) {
            i.food_cate = '甜點'
        } else if (i.food_cate == 4) {
            i.food_cate = '飲料'
        } else if (i.food_cate == 5) {
            i.food_cate = '湯品'
        }
    })

    res.json(output)
})

router.get('/item-management', async (req, res) => {
    // res.json(req.body)

    const output = await getListData(req, req.query.shop_id);
    // if (output.redirect) {
    //     return res.redirect(output.redirect)
    // }

    output.rows.forEach(i => {
        i.create_time = dayjs(i.create_time).format('YYYY-MM-DD HH:mm:ss')
        if (i.food_cate == 1) {
            i.food_cate = '開胃菜'
        } else if (i.food_cate == 2) {
            i.food_cate = '主餐'
        } else if (i.food_cate == 3) {
            i.food_cate = '甜點'
        } else if (i.food_cate == 4) {
            i.food_cate = '飲料'
        } else if (i.food_cate == 5) {
            i.food_cate = '湯品'
        }
    })

    // console.log(output)
    res.json(output)
})

router.post('/get-all-item-management', async (req, res) => {
    const sql = "SELECT * FROM `food_items` WHERE `shop_id`=?;"
    const output = await getAllListData(req, req.body.id)
    output.rows.forEach(i => {
        i.create_time = dayjs(i.create_time).format('YYYY-MM-DD HH:mm:ss')
        if (i.food_cate == 1) {
            i.food_cate = '開胃菜'
        } else if (i.food_cate == 2) {
            i.food_cate = '主餐'
        } else if (i.food_cate == 3) {
            i.food_cate = '甜點'
        } else if (i.food_cate == 4) {
            i.food_cate = '飲料'
        } else if (i.food_cate == 5) {
            i.food_cate = '湯品'
        }
    })
    res.json(output)
    // res.json(req.body)
})

// console.log(output)
// res.json(output)

// 商品排序:由新到舊
router.post('/item-management/DESC', async (req, res) => {
    const output = await getListData(req, req.body.id);
    if (output.redirect) {
        return res.redirect(output.redirect)
    }

    output.rows.forEach(i => {
        i.create_time = dayjs(i.create_time).format('YYYY-MM-DD HH:mm:ss')
    })

    //console.log(output)
    res.json(output)
})
// 商品排序:由舊到新
router.post('/item-management/ASC', async (req, res) => {
    //console.log('getListDataASC')
    const output = await getListDataASC(req, parseInt(req.body.id));
    if (output.redirect) {
        return res.redirect(output.redirect)
    }

    output.rows.forEach(i => {
        i.create_time = dayjs(i.create_time).format('YYYY-MM-DD HH:mm:ss')
    })

    //console.log(output)
    res.json(output)
})

// 商品編輯:搜尋商品
router.post('/item-search', async (req, res) => {
    res.json(req.body)
    const keyword = req.body.keyword;
})

// 餐廳編輯商品
// 1、先取得資料
router.get('/item-management/editItem/:food_id', async (req, res) => {

    const output = {
        success: false,
        error: '',
        data: null
    }

    // console.log(req.params) // { food_id: '100' }
    const food_id = parseInt(req.params.food_id) || 0
    // console.log(food_id)    // 100

    const sql = `SELECT * FROM food_items WHERE food_id=?`
    const [result] = await db.query(sql, [food_id])

    //console.log('------result-------')
    //console.log(result)
    //console.log('------result-------')


    if (!result.length) {
        output.error = '沒有該筆資料'
        res.json(output)
    } else {
        let food_cate = ''
        if (result[0].food_cate == 1) {
            food_cate = '開胃菜'
        } else if (result[0].food_cate == 2) {
            food_cate = '主餐'
        } else if (result[0].food_cate == 3) {
            food_cate = '甜點'
        } else if (result[0].food_cate == 4) {
            food_cate = '飲料'
        } else if (result[0].food_cate == 5) {
            food_cate = '湯品'
        }
        result[0].food_cate = food_cate
        output.data = result;
        output.success = true;
        res.json(output)
    }

    // res.json(result)
})

// 2、把修改完的資料放回資料庫

// 餐廳刪除商品
router.delete('/item-management/deleteItem/:food_id', async (req, res) => {
    const { food_id } = req.params;

    // res.send(req.params.food_id)

    const sql = `DELETE FROM \`food_items\` WHERE food_id=?`;
    const [result] = await db.query(sql, [food_id])

    res.json(result)
})

// 餐廳商品關鍵字搜尋(get)和換頁功能
// router.get('/:Keyword', async (req, res) => {
//     // console.log(req.params)                 // { Keyword: 'item-management' }
//     // console.log(req.query)                  // { keyword: 'qwerty', shop_id: '1' }
//     const keyword = req.query.keyword || '' // string
//     const shop_id = req.query.shop_id || 0
//     const output = await getListData(req, shop_id, keyword)
//     output.rows.forEach(i => {
//         i.create_time = dayjs(i.create_time).format('YYYY-MM-DD HH:mm:ss')
//     })

//     let page = req.query.page ? parseInt(req.query.page) : 1;
//     if (!page || page < 1) {
//       output.redirect = req.baseUrl;
//       return res.json(output);
//     }

//     let where = " WHERE 1 ";
//     if (keyword) {
//       const kw_escaped = db.escape("%" + keyword + "%");
//       where += ` AND (
//             \`food_title\` LIKE ${kw_escaped} 
//             OR
//             \`food_des\` LIKE ${kw_escaped}
//             )
//           `;
//     }

//     const perPage = 10
//     const t_sql = `SELECT COUNT(1) totalRows FROM food_items ${where}`;
//     const [[{ totalRows }]] = await db.query(t_sql);
//     let totalPages = 0;
//     let rows = [];
//     if (totalRows) {
//       totalPages = Math.ceil(totalRows / perPage);
//       if (page > totalPages) {
//         output.redirect = req.baseUrl + "?page=" + totalPages;
//         return res.json(output);
//       }
//       const sql = ` SELECT * FROM products ${where} LIMIT ${
//         perPage * (page - 1)
//       }, ${perPage}`;
//       [rows] = await db.query(sql);
//     }

//     console.log(output)
//     // {
//     //     redirect: '',
//     //     totalRows: 5,
//     //     perPage: 50,
//     //     totalPages: 1,
//     //     page: 1,
//     //     rows: [
//     //       {
//     //         food_id: 139,
//     //         shop_id: 1,
//     //         food_img: 'default_image.jpg',
//     //         food_cate: 2,
//     //         food_title: '魯肉飯',
//     //         food_des: '經典台灣小吃，滷肉飯搭配滷肉、醬油蛋、酸菜等配料。',
//     //         food_price: 50,
//     //         food_note: null,
//     //         create_time: null
//     //       },
//     //     ],
//     //     baseUrl: '/res',
//     //     keyword: '滷肉'
//     //   }
//     res.json(output)                     // { keyword: 'qwerty' }

// })

// 商家取得訂單資料
router.post('/getShopOrder', async (req, res) => {
    // res.json(req.body)
    const output = {
        success: false,
        error: '',
        data: null,
        data1: null,
        data2: null,
        data3: null,
        reqBody: req.body
    }

    // 先隨便拿資料
    const sql = "SELECT `subA`.`open_sid`, `subA`.`order_sid`, `buy_for_me_detail`.`order_food`, `buy_for_me_detail`.`order_quantity`, `buy_for_me_detail`.`order_price`, `buy_for_me_detail`.`order_detail_sid`, `subA`.`target_store`, `subA`.`open_time`, `subA`.`order_instructions`, `food_items`.`food_title`, `food_items`.`food_id` FROM ( SELECT `open_for_you`.`open_sid`, `open_for_you`.`target_store`, `open_for_you`.`open_time`, `buy_for_me`.`order_sid`, `buy_for_me`.`order_instructions` FROM `open_for_you` JOIN `buy_for_me` ON `open_for_you`.`open_sid` = `buy_for_me`.`open_sid` ) AS `subA` JOIN `buy_for_me_detail` ON `buy_for_me_detail`.`order_sid` = `subA`.`order_sid` JOIN `food_items` ON `food_items`.`food_id` = `buy_for_me_detail`.`order_food` WHERE `target_store` = ?;"

    const sql1 = "SELECT * FROM open_for_you WHERE target_store = ? GROUP BY open_for_you.open_sid;"

    const [rows] = await db.query(sql, [parseInt(req.body.id)])      // rows:array
    const [rows1] = await db.query(sql1, [parseInt(req.body.id)])    // rows1:array

    //console.log(rows1)
    for (item of rows1) {
        item.meet_time = dayjs(item.meet_time).format('YYYY-MM-DD HH:mm:ss')
    }
    // rows1[0].meet_time = dayjs(rows1[0].meet_time).format('YYYY-MM-DD HH:mm:ss')

    // console.log(rows)
    const orderSum = rows1.map((v) => {
        let orderArr = [];
        for (i = 0; i < rows.length; i++) {
            if (v.open_sid == rows[i].open_sid) {
                orderArr.push({
                    open_sid: rows[i].open_sid,
                    title: rows[i].food_title,
                    amount: rows[i].order_quantity,
                    price: rows[i].order_price,
                    meet_time: rows[i].meet_time, // 加入meet_time
                });
            }
        }
        return orderArr;
    });

    const result = orderSum.reduce((acc, curr) => {
        curr.forEach((item) => {
            const existingItem = acc.find((i) => i.open_sid === item.open_sid);
            if (existingItem) {
                existingItem.titles.push(item.title);
                existingItem.amounts.push(item.amount);
                existingItem.prices.push(item.price);
                // 若meet_time不同，則合併meet_time，這裡假設相同open_sid的meet_time都一樣
                if (existingItem.meet_time !== item.meet_time) {
                    existingItem.meet_time = existingItem.meet_time + " / " + item.meet_time;
                }
            } else {
                acc.push({
                    open_sid: item.open_sid,
                    titles: [item.title],
                    amounts: [item.amount],
                    prices: [item.price],
                    meet_time: item.meet_time, // 加入meet_time
                });
            }
        });
        return acc;
    }, []);

    const mergedData = result.map((dataObj) => {
        const mergedObj = { ...dataObj };
        const titleMap = new Map();

        for (let i = 0; i < dataObj.titles.length; i++) {
            const title = dataObj.titles[i];
            const amount = dataObj.amounts[i];
            const price = dataObj.prices[i];

            if (titleMap.has(title)) {
                const existingIndex = titleMap.get(title);
                mergedObj.amounts[existingIndex] += amount;
            } else {
                titleMap.set(title, i);
            }
        }

        mergedObj.titles = Array.from(titleMap.keys());
        mergedObj.amounts = Array.from(titleMap.values()).map((index) => mergedObj.amounts[index]);
        mergedObj.prices = Array.from(titleMap.values()).map((index) => mergedObj.prices[index]);

        return mergedObj;
    });


    //   console.log(mergedData);

    output.data = { rows, rows1, orderSum }
    output.data1 = rows1
    output.data2 = orderSum
    output.data3 = mergedData
    res.json(output)
})

// 商家取得訂單資料:外帶
router.post('/getTogoOrder', async (req, res) => {
    const output = {
        order: null,
        order_item: null,
        order_amount: null,
        groupedOrderItems: [] // 新增一個空陣列
    }
    const shop_id = req.body.id
    // console.log(shop_id)

    const sql = "SELECT `order`.`sid`,`status`,`shop_id`,`amount`,`order`.`create_at`,`food_id`,`order_item`,`order_num`,`price` FROM `order` JOIN `order_detail` ON `order`.`sid` = `order_detail`.`order_id` WHERE  `order`.`shop_id`=? ORDER BY sid DESC"

    const [rows] = await db.query(sql, [shop_id])

    // console.log('----------rows---------')
    // console.log(rows)
    // console.log('----------rows---------')
    rows.forEach(i => {
        i.create_at = dayjs(i.create_at).format('YYYY-MM-DD HH:mm:ss')
    })

    const orderList = []
    rows.map((v) => {
        if (!orderList.includes(v.sid)) orderList.push(v.sid)
    })
    const orders = orderList.map((v) => {
        const order_detail = []
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].sid === v) {
                order_detail.push(rows[i])
            }
        }
        return { order_sid: v, order_detail: order_detail }
    })
    // console.log('------orders------')
    // console.log(orders)
    // console.log('------orders------')
    res.json({ orders })


    // let order_items = []
    // rows.map((v, i) => {
    //     order_items.push(v.order_item)
    // })
    // // console.log(order_items)
    // // console.log('rowssssssssssssssssss')
    // // console.log(rows)
    // // console.log('rowssssssssssssssssss')
    // let output_info = []
    // for (let i = 1; i < rows.length; i++) {
    //     if (rows[i].sid == rows[i - 1].sid) {
    //         output_info.push({
    //             sid: rows[i].sid,
    //             status: rows[i].status,
    //             order_item: [rows[i].order_items]
    //         })
    //     }
    // }

    // const uniqueObjects = output_info.reduce((accumulator, currentValue) => {
    //     if (!accumulator[currentValue.sid]) {
    //         accumulator[currentValue.sid] = currentValue;
    //     }
    //     return accumulator;
    // }, {});

    // const result = Object.values(uniqueObjects);
    // // console.log('----------------------------------------')
    // // console.log(result);
    // // console.log('----------------------------------------')
    // const groupedOrderItems = rows.reduce((accumulator, currentValue) => {
    //     const { sid, order_item, order_num, amount, price, status, create_at } = currentValue;
    //     if (!accumulator[sid]) {
    //         accumulator[sid] = [{ order_item, order_num, amount, price, status, sid, create_at }];
    //     } else {
    //         accumulator[sid].push({ order_item, order_num, amount, price, status, sid, create_at });
    //     }
    //     return accumulator;
    // }, {});

    // // console.log('-----groupedOrderItems-----')
    // // console.log(groupedOrderItems);
    // // console.log('-----groupedOrderItems-----')

    // let order_amount = []
    // rows.map((v, i) => {
    //     order_amount.push(v.order_num)
    // })
    // // console.log(order_amount)

    // let order_price = []
    // rows.map((v, i) => {
    //     order_price.push(v.price)
    // })

    // // console.log(order_price)

    // // console.log('分隔線')
    // const outputResult = result.map((v, i) => {
    //     if (rows[i].sid == v.sid) {
    //         return { ...result, order_items: order_items }
    //     }
    // })
    // // console.log('分隔線123')
    // // console.log(outputResult)
    // // console.log('分隔線123')

    // const order_output_all = []
    // const order_output = {}
    // order_output.order_item = order_items;
    // order_output.order_amount = order_amount;
    // order_output.price = order_price
    // order_output.sid = rows[0].sid;
    // order_output.shop_id = rows[0].shop_id;
    // order_output.amount = rows[0].amount;
    // order_output.status = rows[0].status;
    // order_output.create_at = rows[0].create_at
    // console.log(order_output)
    // console.log(row)
    // [
    //     {
    //       sid: 1,
    //       status: '未完成',
    //       shop_id: 31,
    //       amount: 3120,
    //       memo: '不要免洗餐具',
    //       create_at: '2023-07-31 14:15:00',
    //       food_id: 60,
    //       order_item: '去骨牛小排',
    //       order_num: 2,
    //       price: 680
    //     },
    //     {
    //       sid: 1,
    //       status: '未完成',
    //       shop_id: 31,
    //       amount: 3120,
    //       memo: '不要免洗餐具',
    //       create_at: '2023-07-31 14:15:00',
    //       food_id: 61,
    //       order_item: '紐西蘭菲力牛排',
    //       order_num: 1,
    //       price: 480
    //     },
    //     {
    //       sid: 1,
    //       status: '未完成',
    //       shop_id: 31,
    //       amount: 3120,
    //       memo: '不要免洗餐具',
    //       create_at: '2023-07-31 14:15:00',
    //       food_id: 62,
    //       order_item: '美國紐約頂級牛排',
    //       order_num: 1,
    //       price: 600
    //     },
    //     {
    //       sid: 1,
    //       status: '未完成',
    //       shop_id: 31,
    //       amount: 3120,
    //       memo: '不要免洗餐具',
    //       create_at: '2023-07-31 14:15:00',
    //       food_id: 63,
    //       order_item: '燒烤無骨牛小排',
    //       order_num: 1,
    //       price: 680
    //     }
    //   ]

    // output.order = [rows]
    // output.order_item = order_items
    // output.order_amount = order_amount

    // order_output.groupedOrderItems = Object.values(groupedOrderItems);


    // // console.log(order_output.groupedOrderItems.length)  // 118

    // const perPage = 10
    // const totalPages = Math.ceil(order_output.groupedOrderItems.length / perPage)
    // order_output.totalPages = totalPages
    // console.log(totalPages)
    // res.json(order_output)
})

// 取得單筆資料(驗證過登入)
router.get('/api/verify/:sid', async (req, res) => {
    // 1、先設定要輸出的output
    const output = {
        success: false,
        error: '',
        data: null,
    }

    // 如果沒有JSONWebToken && 如果有JWT
    if (!res.locals.jwtData) {
        output.error = '沒有token驗證';
        return res.json(output)
    } else {
        output.jwtData = res.locals.jwtData
    }

    const sid = parseInt(req.params.sid) || 0;
    if (!sid) {
        output.error = '沒有這筆資料';
        return res.json(output)
    }

    const sql = `SELECT * FROM address_book WHERE sid=${sid}`
    const [rows] = await db.query(sql)  // array

    // 檢查是否有這個欄位，沒有就顯示error
    if (!rows.length) {
        output.error = 'No Data';
        return res.json(output)
    } else {
        // 調整時間格式
        rows[0].birthday = dayjs(rows[0].birthday).format('YYYY-MM-DD')
        output.data = rows
        return res.json(output)
    }

})

// 測試表單(checkbox&radio button)
router.get('/add-try', async (req, res) => {
    res.render('address-book/add-try');
});
router.post('/add-try', resMultipartParser, async (req, res) => {
    res.json(req.body);
});

// 把修改完的資料寫回資料庫(寫在這是因為另一個商品的put是用動態路由，不寫在其前面會出錯)
router.put('/res-setting', async (req, res) => {
    // res.json(req.body)
    const output = {
        success: false,
        error: '',
        shopData: null,
        shopOpenTimeData: null,
    }

    // 先修改資料表的資料
    let city = ''
    if (req.body.city == '台北市') {
        city = 1
    } else if (req.body.city == '新北市') {
        city = 2
    } else if (req.body.city == '基隆市') {
        city = 3
    }

    let res_cate;
    if (req.body.res_cate == '中式') {
        res_cate = 1
    } else if (req.body.res_cate == '西式') {
        res_cate = 2
    } else if (req.body.res_cate == '日式') {
        res_cate = 3
    } else if (req.body.res_cate == '韓式') {
        res_cate = 4
    } else if (req.body.res_cate == '美式') {
        res_cate = 5
    } else if (req.body.res_cate == '泰式') {
        res_cate = 6
    }

    let area = ''
    if (req.body.city == '台北市' && req.body.area == '中正區') {
        area = 0
    } else if (req.body.city == '台北市' && req.body.area == '大同區') {
        area = 1
    } else if (req.body.city == '台北市' && req.body.area == '中山區') {
        area = 2
    } else if (req.body.city == '台北市' && req.body.area == '松山區') {
        area = 3
    } else if (req.body.city == '台北市' && req.body.area == '大安區') {
        area = 4
    } else if (req.body.city == '台北市' && req.body.area == '萬華區') {
        area = 5
    } else if (req.body.city == '台北市' && req.body.area == '信義區') {
        area = 6
    } else if (req.body.city == '台北市' && req.body.area == '士林區') {
        area = 7
    } else if (req.body.city == '台北市' && req.body.area == '北投區') {
        area = 8
    } else if (req.body.city == '台北市' && req.body.area == '內湖區') {
        area = 9
    } else if (req.body.city == '台北市' && req.body.area == '南港區') {
        area = 10
    } else if (req.body.city == '台北市' && req.body.area == '文山區') {
        area = 11
    } else if (req.body.city == '新北市' && req.body.area == '萬里區') {
        area = 0
    } else if (req.body.city == '新北市' && req.body.area == '金山區') {
        area = 1
    } else if (req.body.city == '新北市' && req.body.area == '板橋區') {
        area = 2
    } else if (req.body.city == '新北市' && req.body.area == '汐止區') {
        area = 3
    } else if (req.body.city == '新北市' && req.body.area == '深坑區') {
        area = 4
    } else if (req.body.city == '新北市' && req.body.area == '石碇區') {
        area = 5
    } else if (req.body.city == '新北市' && req.body.area == '瑞芳區') {
        area = 6
    } else if (req.body.city == '新北市' && req.body.area == '平溪區') {
        area = 7
    } else if (req.body.city == '新北市' && req.body.area == '雙溪區') {
        area = 8
    } else if (req.body.city == '新北市' && req.body.area == '貢寮區') {
        area = 9
    } else if (req.body.city == '新北市' && req.body.area == '新店區') {
        area = 10
    } else if (req.body.city == '新北市' && req.body.area == '坪林區') {
        area = 11
    } else if (req.body.city == '新北市' && req.body.area == '烏來區') {
        area = 12
    } else if (req.body.city == '新北市' && req.body.area == '永和區') {
        area = 13
    } else if (req.body.city == '新北市' && req.body.area == '中和區') {
        area = 14
    } else if (req.body.city == '新北市' && req.body.area == '土城區') {
        area = 15
    } else if (req.body.city == '新北市' && req.body.area == '三峽區') {
        area = 16
    } else if (req.body.city == '新北市' && req.body.area == '樹林區') {
        area = 17
    } else if (req.body.city == '新北市' && req.body.area == '鶯歌區') {
        area = 18
    } else if (req.body.city == '新北市' && req.body.area == '三重區') {
        area = 19
    } else if (req.body.city == '新北市' && req.body.area == '新莊區') {
        area = 20
    } else if (req.body.city == '新北市' && req.body.area == '泰山區') {
        area = 21
    } else if (req.body.city == '新北市' && req.body.area == '林口區') {
        area = 22
    } else if (req.body.city == '新北市' && req.body.area == '蘆洲區') {
        area = 23
    } else if (req.body.city == '新北市' && req.body.area == '五股區') {
        area = 24
    } else if (req.body.city == '新北市' && req.body.area == '八里區') {
        area = 25
    } else if (req.body.city == '新北市' && req.body.area == '淡水區') {
        area = 26
    } else if (req.body.city == '新北市' && req.body.area == '三芝區') {
        area = 27
    } else if (req.body.city == '新北市' && req.body.area == '石門區') {
        area = 28
    } else if (req.body.city == '基隆市' && req.body.area == '仁愛區') {
        area = 0
    } else if (req.body.city == '基隆市' && req.body.area == '信義區') {
        area = 1
    } else if (req.body.city == '基隆市' && req.body.area == '中正區') {
        area = 2
    } else if (req.body.city == '基隆市' && req.body.area == '中山區') {
        area = 3
    } else if (req.body.city == '基隆市' && req.body.area == '安樂區') {
        area = 4
    } else if (req.body.city == '基隆市' && req.body.area == '暖暖區') {
        area = 5
    } else if (req.body.city == '基隆市' && req.body.area == '七堵區') {
        area = 6
    }

    // 判斷營業日期
    const openTimeArray = [0, 0, 0, 0, 0, 0, 0,]
    const openDays = req.body.open_days // array
    for (let openday of openDays) {
        if (openday == '星期一') {
            openTimeArray[0] = 1
        } else if (openday == '星期二') {
            openTimeArray[1] = 1
        } else if (openday == '星期三') {
            openTimeArray[2] = 1
        } else if (openday == '星期四') {
            openTimeArray[3] = 1
        } else if (openday == '星期五') {
            openTimeArray[4] = 1
        } else if (openday == '星期六') {
            openTimeArray[5] = 1
        } else if (openday == '星期日') {
            openTimeArray[6] = 1
        }
    }

    // 先修改shops資料表，再修改res_opentime資料表
    const updateShopSQL = "UPDATE `shops` SET `" +
        "account`=?,`shop`=?,`owner`=?,`category`=?,`res_desc`=?," +
        "`avg_consumption`=?,`photo`=?,`city`=?,`area`=?,`location`=?," +
        "`phone`=?,`latitude`=?,`longitude`=? WHERE sid=?";
    const [shopUpdateResult] = await db.query(updateShopSQL, [
        req.body.account,
        req.body.shopname,
        req.body.owner,
        res_cate,
        req.body.description,
        req.body.avg_consumption,
        req.body.photo,
        city,
        area,
        req.body.fulladdress1,
        req.body.phone,
        req.body.latitude,
        req.body.longitude,
        req.body.shopId,
    ])

    const updateOpenTimeSQL = "UPDATE `res_opentime` SET" +
        " `open_time`=?,`close_time`=?," +
        "`Monday`=?,`Tuesday`=?,`Wednesday`=?," +
        "`Thursday`=?,`Friday`=?,`Saturday`=?,`Sunday`=?" +
        " WHERE res_id=?"
    const [openTimeUpdateResult] = await db.query(updateOpenTimeSQL, [
        req.body.open_time,
        req.body.close_time,
        openTimeArray[0],
        openTimeArray[1],
        openTimeArray[2],
        openTimeArray[3],
        openTimeArray[4],
        openTimeArray[5],
        openTimeArray[6],
        req.body.shopId
    ])

    output.shopData = shopUpdateResult
    output.shopOpenTimeData = openTimeUpdateResult
    res.json(output)
})

// 修改餐廳商品的api
router.put('/:food_id', async (req, res) => {
    const output = {
        success: false,
        error: '',
        data: null,
    }

    const food_id = parseInt(req.params.food_id) // 100

    // 先找到那筆資料
    const sql = `SELECT * FROM food_items WHERE food_id=?`
    const [rows] = await db.query(sql, [food_id])
    //console.log(rows) // array
    if (!rows.length) {
        output.error = '沒有該筆資料'
        res.json(output)
    }

    // const { photo, name, description, food_cate, price, note } = req.body;
    //const { food_cate } = req.body;

    let food_cate = 0
    if (req.body.food_cate === '開胃菜') {
        food_cate = 1
    } else if (req.body.food_cate === '主餐') {
        food_cate = 2
    } else if (req.body.food_cate === '甜點') {
        food_cate = 3
    } else if (req.body.food_cate === '飲料') {
        food_cate = 4
    } else if (req.body.food_cate === '湯品') {
        food_cate = 5
    }

    // console.log(req.body)

    // 有資料的話，用req.body傳過來的東西以展開運算子更新
    const { create_time, ...orgin } = { ...rows[0] }
    const newData = { ...orgin, ...req.body, food_cate: food_cate }
    console.log(JSON.stringify(newData))
    const sql3 = "UPDATE `food_items` SET `food_img` = ?, `food_cate` = ?, `food_title` = ?, `food_des` = ?, `food_price` = ?, `food_note` = ? WHERE food_id=?"
    const [result] = await db.query(sql3, [newData.food_img, newData.food_cate, newData.food_title, newData.food_des, newData.food_price, newData.food_note, food_id])

    // console.log(result)

    output.data = result

    res.json(output)

    // res.json(req.params)
})

// 商家編輯資料
// 從後端獲得資料
router.post('/getShopData', async (req, res) => {
    const shop_id = parseInt(req.body.id)
    // res.json(req.body)
    const sql = "SELECT * FROM shops INNER JOIN res_opentime ON shops.sid = res_opentime.res_id WHERE shops.sid=?"

    const [rows] = await db.query(sql, [shop_id])

    // console.log('-------------rows------------------')
    // console.log(rows)
    // console.log('-------------rows------------------')

    const result = rows[0]

    const phone = result.phone
    //result.phone = '0' + String(phone)
    // console.log(result)

    let res_cate = '';
    if (result.category == 1) {
        res_cate = '中式'
    } else if (result.category == 2) {
        res_cate = '西式'
    } else if (result.category == 3) {
        res_cate = '日式'
    } else if (result.category == 4) {
        res_cate = '韓式'
    } else if (result.category == 5) {
        res_cate = '美式'
    } else if (result.category == 6) {
        res_cate = '泰式'
    }


    let city = '';
    if (result.city == 1) {
        city = '台北市'
    } else if (result.city == 2) {
        city = '新北市'
    } else if (result.city == 3) {
        city = '基隆市'
    }

    let area = ''
    if (result.city == 1 && result.area == '0') {
        area = '中正區'
    } else if (result.city == 1 && result.area == '1') {
        area = '大同區'
    } else if (result.city == 1 && result.area == '2') {
        area = '中山區'
    } else if (result.city == 1 && result.area == '3') {
        area = '松山區'
    } else if (result.city == 1 && result.area == '4') {
        area = '大安區'
    } else if (result.city == 1 && result.area == '5') {
        area = '萬華區'
    } else if (result.city == 1 && result.area == '6') {
        area = '信義區'
    } else if (result.city == 1 && result.area == '7') {
        area = '士林區'
    } else if (result.city == 1 && result.area == '8') {
        area = '北投區'
    } else if (result.city == 1 && result.area == '9') {
        area = '內湖區'
    } else if (result.city == 1 && result.area == '10') {
        area = '南港區'
    } else if (result.city == 1 && result.area == '11') {
        area = '文山區'
    } else if (result.city == 2 && result.area == '0') {
        area = '萬里區'
    } else if (result.city == 2 && result.area == '1') {
        area = '金山區'
    } else if (result.city == 2 && result.area == '2') {
        area = '板橋區'
    } else if (result.city == 2 && result.area == '3') {
        area = '汐止區'
    } else if (result.city == 2 && result.area == '4') {
        area = '深坑區'
    } else if (result.city == 2 && result.area == '5') {
        area = '石碇區'
    } else if (result.city == 2 && result.area == '6') {
        area = '瑞芳區'
    } else if (result.city == 2 && result.area == '7') {
        area = '平溪區'
    } else if (result.city == 2 && result.area == '8') {
        area = '雙溪區'
    } else if (result.city == 2 && result.area == '9') {
        area = '貢寮區'
    } else if (result.city == 2 && result.area == '10') {
        area = '新店區'
    } else if (result.city == 2 && result.area == '11') {
        area = '坪林區'
    } else if (result.city == 2 && result.area == '12') {
        area = '烏來區'
    } else if (result.city == 2 && result.area == '13') {
        area = '永和區'
    } else if (result.city == 2 && result.area == '14') {
        area = '中和區'
    } else if (result.city == 2 && result.area == '15') {
        area = '土城區'
    } else if (result.city == 2 && result.area == '16') {
        area = '三峽區'
    } else if (result.city == 2 && result.area == '17') {
        area = '樹林區'
    } else if (result.city == 2 && result.area == '18') {
        area = '鶯歌區'
    } else if (result.city == 2 && result.area == '19') {
        area = '三重區'
    } else if (result.city == 2 && result.area == '20') {
        area = '新莊區'
    } else if (result.city == 2 && result.area == '21') {
        area = '泰山區'
    } else if (result.city == 2 && result.area == '22') {
        area = '林口區'
    } else if (result.city == 2 && result.area == '23') {
        area = '蘆洲區'
    } else if (result.city == 2 && result.area == '24') {
        area = '五股區'
    } else if (result.city == 2 && result.area == '25') {
        area = '八里區'
    } else if (result.city == 2 && result.area == '26') {
        area = '淡水區'
    } else if (result.city == 2 && result.area == '27') {
        area = '三芝區'
    } else if (result.city == 2 && result.area == '28') {
        area = '石門區'
    } else if (result.city == ˇ && result.area == '0') {
        area = '仁愛區'
    } else if (result.city == ˇ && result.area == '1') {
        area = '信義區'
    } else if (result.city == ˇ && result.area == '2') {
        area = '中正區'
    } else if (result.city == ˇ && result.area == '3') {
        area = '中山區'
    } else if (result.city == ˇ && result.area == '4') {
        area = '安樂區'
    } else if (result.city == ˇ && result.area == '5') {
        area = '暖暖區'
    } else if (result.city == ˇ && result.area == '6') {
        area = '七堵區'
    }


    res.json({ ...result, city: city, area: area, password: '', category: res_cate })



})

// 商家編輯資料:修改密碼
router.post('/res-setting-password', async (req, res) => {
    // res.json(req.body)
    const output = {
        success: false,
        verify: '',
        error: '',
        data: null
    }
    let body = req.body
    let resId = req.body.resId
    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword
    const getShopSQL = "SELECT * FROM `shops` WHERE sid=?"
    const [getShop] = await db.query(getShopSQL, [resId])
    // console.log(getShop)

    const verify = await bcrypt.compare(req.body.oldPassword, getShop[0].password);
    // console.log(verify);

    if (!verify) {
        console.log('密碼驗證不符')
        output.error = '密碼不符合!'
        return res.json(output)
    } else {
        console.log('密碼驗證正確')
        const salt = bcrypt.genSaltSync(10)
        const hashPassword = await bcrypt.hash(req.body.newPassword, salt)

        const changePasswordSQL = "UPDATE `shops` SET `password`=? WHERE sid=?"
        const [result] = await db.query(changePasswordSQL, [hashPassword, resId])
        output.success = true
        output.shopData = result
        return res.json(output)
    }

    // if (getShop[0].password !== oldPassword) {
    //     console.log('密碼驗證不符')
    //     output.error = '密碼不符合!'
    //     return res.json(output)
    // } else {
    //     console.log('密碼驗證正確')
    //     const changePasswordSQL = "UPDATE `shops` SET `password`=? WHERE sid=?"
    //     const [result] = await db.query(changePasswordSQL, [newPassword, resId])
    //     output.success = true
    //     output.shopData = result
    //     return res.json(output)
    // }

    // res.json({body,getShop})

})

module.exports = router;