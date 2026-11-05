window.TOPICS = [
 {id:1,icon:"🤝",name:"Làm quen và kết bạn",desc:"Chào hỏi, giới thiệu bản thân, mở lời kết bạn.",goal:"Biết chủ động chào hỏi và bắt chuyện thân thiện.",skills:["Chào hỏi và giới thiệu bản thân","Hỏi han để hiểu bạn mới","Rủ bạn cùng tham gia hoạt động"],situations:["Bạn mới chuyển đến lớp","Em muốn làm quen với bạn ngồi bên cạnh"]},
 {id:2,icon:"💞",name:"Xây dựng và duy trì tình bạn",desc:"Giữ lời hứa, chia sẻ và giải quyết mâu thuẫn với bạn.",goal:"Biết giữ gìn tình bạn bằng lời nói và hành động tử tế.",skills:["Giữ lời hứa","Chia sẻ và nhường nhịn","Làm hòa sau khi giận nhau"],situations:["Khi bạn không muốn chơi cùng","Hai bạn thân giận nhau"]},
 {id:3,icon:"🫶",name:"Cảm thông và giúp đỡ người khác",desc:"Nhận ra cảm xúc của bạn và biết hỏi han, an ủi.",goal:"Biết đặt mình vào vị trí người khác và giúp đỡ đúng lúc.",skills:["Nhận biết cảm xúc của bạn","An ủi, động viên","Hỏi trước khi giúp"],situations:["Bạn bị điểm kém và buồn","Bạn quên mang đồ dùng học tập"]},
 {id:4,icon:"🗣️",name:"Giao tiếp và hợp tác trong học tập",desc:"Lắng nghe, nêu ý kiến và phối hợp khi làm việc nhóm.",goal:"Biết trao đổi, tôn trọng ý kiến khác biệt và cùng hoàn thành nhiệm vụ.",skills:["Biết lắng nghe khi người khác trình bày","Biết diễn đạt ý kiến cá nhân","Biết đưa ra lời nhận xét phù hợp","Biết tôn trọng ý kiến khác biệt","Biết trao đổi và giải quyết bất đồng","Biết phối hợp với các thành viên khi làm việc nhóm"],situations:["Khi có ý kiến khác với các thành viên trong nhóm","Nhóm chia việc chưa công bằng"]},
 {id:5,icon:"🙏",name:"Giao tiếp lịch sự: cảm ơn, xin lỗi và ứng xử phù hợp",desc:"Nói cảm ơn, xin lỗi và dùng lời lẽ lịch sự.",goal:"Biết dùng lời nói lịch sự đúng lúc, đúng người.",skills:["Nói cảm ơn chân thành","Xin lỗi khi mắc lỗi","Xưng hô lễ phép"],situations:["Khi vô tình làm hỏng đồ dùng của bạn","Nhận được quà từ cô giáo"]},
 {id:6,icon:"🏠",name:"Ứng xử trong các tình huống đời sống",desc:"Ứng xử ở nhà, nơi công cộng, khi nhờ giúp đỡ.",goal:"Biết ứng xử văn minh trong những tình huống quen thuộc.",skills:["Nhờ giúp đỡ lịch sự","Cư xử nơi công cộng","Trò chuyện với người lớn"],situations:["Khi cần nhờ người khác giúp đỡ","Xếp hàng ở căng tin"]},
 {id:7,icon:"🛡️",name:"Bảo vệ bản thân trong giao tiếp",desc:"Biết từ chối, nói “không” và tìm người lớn tin cậy.",goal:"Biết giữ an toàn và nhờ giúp đỡ khi gặp tình huống không an toàn.",skills:["Từ chối lịch sự nhưng kiên quyết","Nhận ra tình huống không an toàn","Tìm người lớn tin cậy"],situations:["Khi thấy một bạn bị trêu chọc","Người lạ rủ em đi cùng"]}
];
window.SUBJECTS = ["Tiếng Việt 4","Đạo đức 4","Tích hợp liên môn","Hoạt động trải nghiệm"];
window.TYPES = {video:["Video","🎬"],game:["Trò chơi","🎮"],worksheet:["Phiếu bài tập","📝"],roleplay:["Thẻ đóng vai","🎭"],selfcheck:["Phiếu tự đánh giá","✅"],comic:["Truyện tranh","📖"],guide:["Tài liệu hướng dẫn","📘"]};
window.PURPOSES = ["Khởi động","Khám phá","Luyện tập","Vận dụng","Đánh giá"];
window.LEVELS = ["Cơ bản","Trung bình","Nâng cao"];
window.AUDIENCES = ["Giáo viên","Học sinh","Cả giáo viên và học sinh"];
window.STATUS = {draft:["Bản nháp",""],pending:["Chờ duyệt","y"],reviewing:["Đang kiểm duyệt","y"],revision:["Yêu cầu chỉnh sửa","o"],approved:["Đã phê duyệt","g"],rejected:["Bị từ chối","r"],hidden:["Đã ẩn",""]};

// Dữ liệu minh họa khi chưa cấu hình Supabase (chế độ demo)
window.DEMO_RESOURCES = [
 {id:"d1",title:"Video: Cả nhóm cùng tranh luận",description:"Video 3 phút về nhóm bạn có ý kiến khác nhau khi làm poster.",subject:"Tiếng Việt 4",topic_id:4,type:"video",purpose:"Khám phá",audience:"Cả giáo viên và học sinh",level:"Cơ bản",author_name:"Nhóm phát triển",views:128,downloads:12,allow_download:false,usage_guide:"Dừng video ở phút 2 và hỏi học sinh: nếu là em, em sẽ nói gì?",source:"Nhóm tự biên soạn",license:"CC BY-NC"},
 {id:"d2",title:"Trò chơi: Chọn lời nói phù hợp",description:"10 câu hỏi nhanh, chọn câu nói lịch sự nhất.",subject:"Đạo đức 4",topic_id:5,type:"game",purpose:"Luyện tập",audience:"Học sinh",level:"Cơ bản",author_name:"Nhóm phát triển",views:240,downloads:30,allow_download:true,usage_guide:"Chơi theo cặp, mỗi cặp 5 phút.",source:"Nhóm tự biên soạn",license:"CC BY-NC"},
 {id:"d3",title:"Phiếu bài tập: Giải quyết bất đồng",description:"Điền cách nói “Mình nghĩ… vì…” khi không đồng ý với bạn.",subject:"Tiếng Việt 4",topic_id:4,type:"worksheet",purpose:"Vận dụng",audience:"Học sinh",level:"Trung bình",author_name:"Sinh viên K45",views:96,downloads:21,allow_download:true,usage_guide:"In A4, làm cá nhân rồi chia sẻ theo cặp.",source:"Tự biên soạn",license:"CC BY"},
 {id:"d4",title:"Bộ thẻ đóng vai: Xin lỗi khi lỡ làm hỏng đồ",description:"6 thẻ tình huống kèm gợi ý lời thoại.",subject:"Hoạt động trải nghiệm",topic_id:5,type:"roleplay",purpose:"Vận dụng",audience:"Cả giáo viên và học sinh",level:"Cơ bản",author_name:"Cô Lan",views:75,downloads:9,allow_download:true,usage_guide:"Chia lớp 6 nhóm, mỗi nhóm một thẻ.",source:"Tự biên soạn",license:"CC BY-NC"},
 {id:"d5",title:"Phiếu tự đánh giá kỹ năng lắng nghe",description:"5 câu tự hỏi sau mỗi giờ thảo luận nhóm.",subject:"Hoạt động trải nghiệm",topic_id:4,type:"selfcheck",purpose:"Đánh giá",audience:"Học sinh",level:"Cơ bản",author_name:"Nhóm phát triển",views:60,downloads:14,allow_download:true,usage_guide:"Phát cuối tiết, thu lại để nhận xét.",source:"Tự biên soạn",license:"CC BY-NC"},
 {id:"d6",title:"Truyện tranh: Em nói “không” với người lạ",description:"Truyện 8 khung hình về cách từ chối và tìm người lớn.",subject:"Tích hợp liên môn",topic_id:7,type:"comic",purpose:"Khám phá",audience:"Học sinh",level:"Trung bình",author_name:"Sinh viên K46",views:180,downloads:40,allow_download:true,usage_guide:"Đọc to, dừng ở khung 5 để học sinh dự đoán.",source:"Tự vẽ",license:"CC BY"}
];

window.SCENARIOS = [
 {q:"Bạn Nam nói: “Mình không muốn chơi cùng cậu hôm nay.” Em sẽ làm gì?",topic:2,opts:[
  ["Nói: “Không sao, hôm khác mình chơi nhé.” rồi rủ bạn khác.",1,"Em giữ được bình tĩnh và tôn trọng quyết định của bạn. Bạn có thể đổi ý vào lúc khác."],
  ["Giận và nói xấu Nam với các bạn.",0,"Nói xấu làm tổn thương bạn và khiến tình bạn khó hàn gắn hơn."],
  ["Nằng nặc đòi chơi bằng được.",0,"Ép buộc khiến bạn khó chịu hơn. Mỗi người đều có quyền từ chối."]]},
 {q:"Em vô tình làm rơi và hỏng hộp bút của bạn Lan. Em nên nói gì?",topic:5,opts:[
  ["Im lặng, bỏ đi chỗ khác.",0,"Im lặng làm bạn buồn và không hiểu chuyện gì xảy ra."],
  ["“Mình xin lỗi, mình lỡ tay làm hỏng. Mình giúp cậu sửa nhé?”",1,"Em nhận lỗi, nói rõ lý do và đề nghị giúp. Đây là cách xin lỗi chân thành."],
  ["“Tại hộp bút để chỗ đó chứ!”",0,"Đổ lỗi cho bạn khiến bạn càng buồn và giận hơn."]]},
 {q:"Nhóm em có ý kiến khác nhau về cách làm poster. Em nên làm gì?",topic:4,opts:[
  ["Nghe bạn nói hết, rồi nêu ý kiến: “Mình nghĩ… vì…”.",1,"Lắng nghe rồi nêu lý do giúp cả nhóm cùng chọn được cách tốt nhất."],
  ["Ngắt lời và nói to hơn để bạn nghe theo.",0,"Ngắt lời khiến bạn không muốn hợp tác."],
  ["Không nói gì, làm theo dù không đồng ý.",0,"Em cần nêu ý kiến của mình một cách lịch sự để nhóm hiểu em."]]},
 {q:"Em thấy một bạn bị trêu chọc vì chiếc cặp cũ. Em nên làm gì?",topic:7,opts:[
  ["Cười theo cho vui.",0,"Cười theo là tiếp tay cho việc trêu chọc."],
  ["Nói nhẹ nhàng: “Dừng lại đi, như vậy bạn buồn đấy.” và báo với cô giáo nếu còn tiếp diễn.",1,"Em vừa bảo vệ bạn vừa tìm sự giúp đỡ của người lớn một cách an toàn."],
  ["Mặc kệ vì không liên quan đến em.",0,"Khi thấy bạn bị tổn thương, em có thể làm điều gì đó nhỏ nhưng có ích."]]},
 {q:"Em cần bạn cho mượn cục tẩy. Em nói thế nào?",topic:6,opts:[
  ["“Cho tao mượn tẩy!”",0,"Cách nói cộc lốc, thiếu lịch sự."],
  ["Tự lấy luôn mà không hỏi.",0,"Lấy đồ khi chưa được đồng ý là thiếu tôn trọng bạn."],
  ["“Bạn cho mình mượn cục tẩy một chút được không? Cảm ơn bạn.”",1,"Có lời nhờ lịch sự, có lời cảm ơn."]]}
];
window.ROLECARDS = [
 {title:"Mượn đồ dùng",scene:"Giờ ra chơi, em cần mượn thước kẻ của bạn.",roles:["Bạn A: cần mượn thước","Bạn B: đang dùng thước"],task:"A nhờ lịch sự, B trả lời và thống nhất cách dùng chung.",hint:"“Bạn cho mình mượn thước một lát được không?”"},
 {title:"Làm hòa",scene:"Hai bạn cãi nhau vì tranh chỗ ngồi.",roles:["Bạn A: đang giận","Bạn B: muốn làm hòa"],task:"B mở lời xin lỗi, A nói cảm xúc của mình.",hint:"“Mình xin lỗi vì đã nói to. Mình muốn mình cùng chơi vui lại.”"},
 {title:"Từ chối an toàn",scene:"Người lạ ngoài cổng trường rủ em đi cùng.",roles:["Em","Người lạ"],task:"Em từ chối kiên quyết và đi tìm người lớn tin cậy.",hint:"“Cháu không đi. Cháu sẽ báo với cô giáo.”"}
];
window.SELFCHECK = ["Em có biết lắng nghe khi người khác nói không?","Em có sử dụng lời nói lịch sự không?","Em có tôn trọng ý kiến của bạn không?","Em có biết xin lỗi khi mắc lỗi không?","Em có biết từ chối khi gặp tình huống không an toàn không?"];
