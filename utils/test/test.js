// const fakeDate = [
//     {
//     'repeat(5)': {
//     user_id: '{{index(70)}}',
//     avatarId: '{{integer(1,5)}}',
//     avatar(tags){
//     const avts = ['http://119.14.42.80:3001/avatar/defaultAvatar.jpg',"http://119.14.42.80:3001/avatar/1714146129294.jpg","http://119.14.42.80:3001/avatar/1714146169905.jpg","http://119.14.42.80:3001/avatar/1714146223017.jpg","http://119.14.42.80:3001/avatar/1714146249302.jpg"];
//     return dts[this.avatarId-1];
//     },
//     username:'{{firstName}}',
//     gender: '{{gender}}',
//     email: '{{email}}',
//     mobile: function(tags) {
//     const num = _.shuffle(_.range(10));
//     let i = 0;
//     const taiwanPhoneFormat = '09xxxxxxxx';
//     return taiwanPhoneFormat.replace(/x/g, () => {
//     if (i < num.length) {
//     return num[i++];
//     } else {
//     return Math.floor(Math.random() * 10);
//     }
//     });
//     },

//     // $2a$12$DQJ3csZUXo3Hh/wArXHg4eUMW.bJgV044g5Le1z3QCqGBgbKr9e4a
//     // companyId: '{{integer(1,3)}}',
//     // departmentName(tags){
//     // const dts = ['管理部', '業務部', '研發部', '工程部', '設計部'];
//     // return dts[this.departmentId-1];
//     // },
//     // companyName(tags){
//     // const cps = ['北','中','南'];
//     // return cps[this.companyId-1];
//     // },
//     // name: '{{firstName()}}',
//     // salary: '{{integer(30000,100000)}}'
//     }
//     }
//     ];

//     JG.repeat(10, {
//         user_id: '{{index(70)}}',
//         mobile() {
//             const num = _.shuffle(_.range(10));
//             let i = 0;
//             const taiwanPhoneFormat = '09xxxxxxxx';
//             return taiwanPhoneFormat.replace(/x/g, () => {
//             if (i < num.length) {
//             return num[i++];
//             } else {
//             return Math.floor(Math.random() * 10);
//             }
//             });
//             },
//       });

//       [
//         '{{repeat(1, 1)}}',
//         {
//           google_uid:'NULL',
//           user_id: '{{index(70)}}',
//           avatar: 'http://119.14.42.80:3001/avatar/defaultAvatar.jpg',
//           username:'{{firstName()}}',
//           email: '{{email(true)}}',
//           password_hash:'NULL',
//           gender: '{{random("男", "女")}}',
//           birthday:'{{date(new Date(1990, 0, 1), new Date(2005, 0, 1), "YYYY-MM-dd")}}',
//           mobile:'{{phone("09xx xxx xxx")}} ',
//           bar_type_id:'{{integer(1, 5)}}',
//           movie_type_id:'{{integer(1, 7)}}',
//           profile_content:'NULL',
//           user_active:'{{random("1", "0")}}'
//         }
//       ]

//       [
//         '{{repeat(1, 1)}}',
//         {
//           avatar: '{{random("http://119.14.42.80:3001/avatar/defaultAvatar.jpg", "http://119.14.42.80:3001/avatar/1714146129294.jpg","http://119.14.42.80:3001/avatar/1714146169905.jpg","http://119.14.42.80:3001/avatar/1714146223017.jpg","http://119.14.42.80:3001/avatar/1714146249302.jpg")}}',
//           username:'{{firstName()}}',
//           email: '{{email(xxxxxx@gmao.com)}}',
//           password_hash:'$2a$12$DQJ3csZUXo3Hh/wArXHg4eUMW.bJgV044g5Le1z3QCqGBgbKr9e4a',
//           gender: '{{random("男", "女")}}',
//           birthday:'{{date(new Date(1990, 0, 1), new Date(2005, 0, 1), "YYYY-MM-dd")}}',
//           mobile:'{{phone("09xx xxx xxx")}} ',
//           bar_type_id:'{{integer(1, 5)}}',
//           movie_type_id:'{{integer(1, 7)}}',
//           profile_content:'{{random("喜歡探索新事物，總是樂於嘗試挑戰自己,興趣愛好廣泛，包括閱讀、旅行和攝影。希望能在這裡結識更多志同道合的朋友！","平時喜歡看電影、打籃球，也喜歡嘗試各種新奇的食物。性格開朗活潑，喜歡和朋友一起分享生活中的點點滴滴。","我是一個熱愛音樂和藝術的人，喜歡彈吉他和繪畫。平時喜歡安靜的生活，但也喜歡和朋友一起享受社交活動。","我是一個熱愛運動和健身的人，平時喜歡去健身房鍛煉身體。我也是一個愛好者，喜歡收集各種不同風格的運動鞋。","我是一個熱愛大自然的人，喜歡到郊外去徒步、露營。平時也喜歡種植一些花草，享受和大自然的親密接觸。","我是一個熱愛讀書的人，喜歡研究各種不同類型的書籍。我認為閱讀是一種很好的學習方式，可以豐富我們的知識和見識。","我是一個熱愛廚藝的人，喜歡嘗試各種不同的菜式和烹飪技巧。我相信美食能夠帶來快樂，也希望能夠和大家一起分享我的烹飪心得。","我是一個熱愛攝影的人，喜歡用相機捕捉生活中的美好瞬間。我覺得攝影是一種藝術，能夠讓我表達內心的感受和情感。","我是一個熱愛旅行的人，喜歡到各地探索不同的文化和風土人情。我認為旅行是一種很好的學習方式，能夠擴展我們的視野。","我是一個熱愛寵物的人，家裡有一隻可愛的狗狗。我喜歡和寵物一起玩耍，覺得他們是生活中的最好伴侶。")}}'}
//       ]

[
    '{{repeat(20, 10)}}',
    {
        avatar: '{{random("http://119.14.42.80:3001/avatar/defaultAvatar.jpg", "http://119.14.42.80:3001/avatar/1714146129294.jpg","http://119.14.42.80:3001/avatar/1714146169905.jpg","http://119.14.42.80:3001/avatar/1714146223017.jpg","http://119.14.42.80:3001/avatar/1714146249302.jpg","http://119.14.42.80:3001/avatar/1714022649248.jpg","http://119.14.42.80:3001/avatar/1713504686701.jpg","http://119.14.42.80:3001/avatar/1713505199247.jpg","http://119.14.42.80:3001/avatar/1713504565834.jpg","http://119.14.42.80:3001/avatar/1713504257124.jpg","http://119.14.42.80:3001/avatar/1713505728771.jpg","http://119.14.42.80:3001/avatar/1713505756575.jpg","http://119.14.42.80:3001/avatar/1713504650270.jpg","http://119.14.42.80:3001/avatar/1713505369545.jpg","http://119.14.42.80:3001/avatar/1713837223062.jpg","http://119.14.42.80:3001/avatar/1713837249711.jpg","http://119.14.42.80:3001/avatar/1714146249303.jpg","http://119.14.42.80:3001/avatar/1714146249305.jpg","http://119.14.42.80:3001/avatar/1714146249306.jpg","http://119.14.42.80:3001/avatar/1714146249307.jpg","http://119.14.42.80:3001/avatar/1714146249308.jpg","http://119.14.42.80:3001/avatar/1714146249309.jpg","http://119.14.42.80:3001/avatar/1714146249309.jpg","http://119.14.42.80:3001/avatar/1714146249309.jpg","http://119.14.42.80:3001/avatar/1714146249310.jpg")}}',
        username: '{{firstName()}}',
        //email: "{{email(xxxxxx@gmail.com)}}",
        email: '{{firstName()}}{{date(new Date(1990, 0, 1), new Date(2005, 0, 1), "MMdd")}}{{random("@gmail.com", "@yahoo.com.tw")}}',
        password_hash:
            '$2a$12$DQJ3csZUXo3Hh/wArXHg4eUMW.bJgV044g5Le1z3QCqGBgbKr9e4a',
        gender: '{{random("男", "女")}}',
        birthday:
            '{{date(new Date(1990, 0, 1), new Date(2005, 0, 1), "YYYY-MM-dd")}}',
        mobile: '{{phone("09xx xxx xxx")}} ',
        bar_type_id: '{{integer(1, 5)}}',
        movie_type_id: '{{integer(1, 7)}}',
        profile_content:
            '{{random("喜歡挑戰自我，經常設定目標並努力實現。相信通過不斷挑戰和突破，才能達到人生的更高峰。", "熱愛旅行和探險，喜歡到各地尋找不同的文化和景觀。每次旅行都是一次心靈的洗禮和成長的機會。", "喜歡創作和表達，喜歡寫作、繪畫或者拍攝照片。認為創作是心靈的出口，可以表達內心的情感和想法。", "喜歡參加各種社交活動和派對，喜歡與不同背景的人交流和互動。對於建立人際關係充滿熱情和能量。", "喜歡觀察和思考人生，喜歡花時間獨處思考和反省。認為了解自己是人生中至關重要的一部分。", "熱愛音樂和表演藝術，喜歡唱歌、彈奏樂器或者表演舞蹈。對於藝術的魅力充滿無限的熱愛和追求。", "喜歡參加社區服務和義工活動，喜歡為社會做出一份微薄的貢獻。相信愛心和奉獻可以改變世界。", "喜歡與家人一起享受美好時光，喜歡舉辦家庭聚會和活動。家庭是我最溫暖的港灣，也是我最大的支持者。", "喜歡學習外語和探索不同的文化，喜歡與外國朋友交流和學習。認為多語言和多文化的能力是現代人的必備素養。", "喜歡參加運動比賽和挑戰活動，喜歡在競技中挑戰自我。勝利和失敗都是人生中重要的養分和經驗。")}}',
    },
];

// https://json-generator.com/
// '喜歡閱讀各種類型的書籍，尤其喜歡探索科學和技術領域的知識。相信知識是改變世界的力量，不斷學習是我不懈的追求。',
//     '熱愛音樂和表演藝術，喜歡參加音樂會和戲劇表演。對於表達情感和情感交流有著深厚的興趣和理解。',
//     '喜歡與不同背景的人交流和互動，願意聆聽他人的故事和觀點。相信理解和包容可以建立更美好的社會。',
//     '喜歡運動和健身，喜歡挑戰自己的身體極限。鍛煉身體不僅能夠保持健康，還能激發個人潛能。',
//     '喜歡參加志願者活動和社區服務，關心弱勢群體的權益和生活環境。願意為社會的進步和發展盡一份力量。',
//     '熱愛廚藝和烹飪，喜歡嘗試各種不同的菜式和烹飪技巧。認為美食是生活的一大樂趣，也是表達愛的方式之一。',
//     '喜歡觀察身邊的事物和人群，喜歡寫作和拍攝照片記錄生活中的點滴。文字和影像是我表達自己的最佳方式。',
//     '喜歡旅行和探索不同的文化和風土人情，喜歡和家人或朋友一起組織自助遊。旅行是我豐富人生的重要部分。',
//     '喜歡學習外語和認識不同國家的文化，願意跨越語言和文化的障礙進行交流和合作。多語言能力是我人生的一大資產。',
//     '喜歡與家人一起參加各種家庭活動和聚會，喜歡在溫馨的家庭氛圍中度過美好時光。家庭是我生命中最重要的支持和力量。';

// 請幫我生成一樣格式的自我介紹，我要十筆，請不要與前一次重複，格式: ("","",....)
