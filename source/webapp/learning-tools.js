/* Small, deterministic learning experiments; shared by Markdown chapters. */
const LearningTools = (() => {
  const definitions = {
    linear:{title:'Một đường thẳng dự đoán điều gì?',prompt:'Giữ x = 2 và mục tiêu y = 4. Đổi hệ số rồi dự đoán sai số trước khi nhìn kết quả.',controls:[['w','Hệ số w',-3,3,.1,1],['b','Hệ số b',-5,5,.1,0]]},
    gradient:{title:'Từng bước xuống dốc, có vệt quỹ đạo',prompt:'Kéo điểm trên đường cong, đổi η rồi dự đoán đường đi trước khi chạy nhiều bước. Đổi η qua 1 để thấy dao động hoặc phân kỳ.',controls:[['x','Điểm bắt đầu x',-3,9,.5,0],['rate','Learning rate η',0,1.2,.05,.1]],prediction:{question:'Với f(x) = (x − 3)², η = 0,1 và x = 0, bước đầu tiên sẽ đi về đâu?',options:[['closer','Tới gần 3 hơn'],['past','Nhảy qua 3'],['same','Đứng yên']],correct:'closer',explain:'Gradient tại x = 0 là −6; bước cập nhật x ← 0 − 0,1 × (−6) = 0,6, gần 3 hơn.'}},
    bayes:{title:'Dấu hiệu xuất hiện, xác suất đổi ra sao?',prompt:'Ví dụ email: dấu hiệu là một từ khóa. Giữ chất lượng dấu hiệu, thay tỉ lệ spam ban đầu.',controls:[['prior','Tỉ lệ spam ban đầu (%)',.1,50,.1,1],['sensitivity','P(dấu hiệu | spam) (%)',0,100,1,90],['specificity','P(không có dấu hiệu | không spam) (%)',0,100,1,95]]},
    matrix:{title:'Một ma trận biến đổi cả mặt phẳng',prompt:'Kéo đầu mút vector v trên hình rồi thay các phần tử ma trận. So v với Av, xem ô đơn vị biến thành hình bình hành và diện tích bằng |det A|.',controls:[['a','Phần tử a₁₁',-2,2,.1,1.5],['b','Phần tử a₁₂',-2,2,.1,.5],['c','Phần tử a₂₁',-2,2,.1,.5],['d','Phần tử a₂₂',-2,2,.1,1.2]],extras:{vx:1,vy:1},prediction:{question:'Nếu |det A| = 2 thì diện tích ô đơn vị sau biến đổi sẽ thế nào?',options:[['double','Tăng gấp đôi'],['same','Không đổi'],['half','Giảm một nửa']],correct:'double',explain:'Định thức là hệ số diện tích có dấu; |det A| = 2 làm diện tích tăng gấp đôi, còn dấu cho biết hướng bị lật hay không.'}},
    metrics:{title:'Cùng một bảng đếm, nhiều thước đo',prompt:'Lớp dương là đối tượng cần phát hiện. Thêm âm tính thật: accuracy có thể tăng dù recall không đổi. Dự đoán trước khi kéo TN.',controls:[['tp','TP · Dương tính đúng',0,200,1,40],['fp','FP · Báo động sai',0,200,1,10],['fn','FN · Bỏ sót',0,200,1,20],['tn','TN · Âm tính đúng',0,1000,5,130]],prediction:{question:'Thêm thật nhiều TN nhưng giữ nguyên TP, FP, FN. Recall và accuracy sẽ ra sao?',options:[['up','Recall giữ nguyên, accuracy tăng'],['down','Recall giảm, accuracy giảm'],['same','Cả hai không đổi']],correct:'up',explain:'Recall = TP/(TP+FN) không dùng TN nên không đổi. Accuracy = (TP+TN)/tổng nên tăng khi TN tăng.'}},
    fedavg:{title:'Ai đóng góp bao nhiêu vào mô hình chung?',prompt:'Hai client cùng khởi đầu và cùng cách biểu diễn tham số. Thay số mẫu để quan sát trung bình có trọng số.',controls:[['na','Số mẫu client A',0,1000,10,100],['nb','Số mẫu client B',0,1000,10,300],['wa','Tham số sau local train · A',-5,5,.1,2.5],['wb','Tham số sau local train · B',-5,5,.1,2.2]],prediction:{question:'Client A có 100 mẫu, client B có 300 mẫu. Trong FedAvg theo số mẫu, tiếng nói của B so với A là:',options:[['three','Gấp ba lần'],['equal','Bằng nhau'],['third','Một phần ba']],correct:'three',explain:'Trọng số tỉ lệ với số mẫu: 300/400 so với 100/400, tức B có trọng số gấp ba A. Điều này không nói B có mô hình local tốt hơn.'}},
    forgetting:{title:'Một điểm trung bình có che mất quên?',prompt:'Đánh giá nhiệm vụ cũ và mới trên các tập test cố định. Đổi điểm của nhiệm vụ cũ sau khi học mới.',controls:[['before','Điểm nhiệm vụ cũ trước khi học mới (%)',0,100,1,90],['old','Điểm nhiệm vụ cũ sau khi học mới (%)',0,100,1,65],['fresh','Điểm nhiệm vụ mới sau khi học (%)',0,100,1,85]]},
    attention:{title:'Raw dot bằng 0 có nghĩa không chú ý?',prompt:'Một query, hai key, hai value (1, 0) và (0, 1). Quan sát softmax sau khi chia √dₖ.',controls:[['s1','Raw dot với key 1',-8,8,.5,1],['s2','Raw dot với key 2',-8,8,.5,0],['dk','Số chiều key dₖ',1,64,1,2]],prediction:{question:'Raw dot với key 2 bằng 0 sau khi chia √dₖ. Trọng số softmax của key 2 sẽ thế nào?',options:[['positive','Có thể vẫn lớn hơn 0'],['zero','Luôn bằng 0'],['one','Luôn bằng 1']],correct:'positive',explain:'Softmax so sánh các logit, không biến điểm 0 thành trọng số 0. Nếu key 1 có logit nhỏ hơn, key 2 vẫn có thể nhận trọng số dương.'}},
    split:{title:'Dành dữ liệu cho ba vai trò',prompt:'Có 1.000 mẫu. Train dùng học tham số; validation chọn cấu hình; test chỉ dùng đánh giá cuối.',controls:[['train','Tỉ lệ train (%)',40,90,1,70],['validation','Tỉ lệ validation (%)',5,40,1,15]]},
    cost:{title:'Đếm chi phí một vòng rồi cộng lại',prompt:'Mô hình dense gửi đầy đủ xuống và lên. Thay số client tham gia và số vòng trước khi tính tổng.',controls:[['size','Kích thước mô hình (MB thập phân)',1,100,1,10],['clients','Client tham gia mỗi vòng',1,100,1,10],['rounds','Số vòng',1,500,1,100]]},
  };
  // Mỗi chương còn lại có một lab gắn với đúng khái niệm của chương.
  const extraDefinitions = {
    formula:{title:'Cùng một công thức, ba cách đọc',prompt:'Chọn dạng công thức rồi đổi x và hệ số. Trước khi nhìn đáp án, đọc thành lời: “đầu ra bằng …”.',controls:[['x','Giá trị đầu vào x',-4,4,.5,1],['a','Hệ số a',-2,3,.5,1],{key:'mode',label:'Dạng công thức',type:'select',options:[['square','a · x²'],['linear','a · x'],['step','a khi x ≥ 0, ngược lại 0']],value:'square'}]},
    ratio:{title:'Tỉ lệ phần trăm không cộng dồn tuyến tính',prompt:'Một đại lượng tăng theo tỉ lệ mỗi năm. Hãy đoán sau 10 năm nó tăng bao nhiêu lần trước khi kéo thanh.',controls:[['initial','Giá trị ban đầu',10,1000,10,100],['rate','Tỉ lệ mỗi năm (%)',-10,30,1,10],['years','Số năm',0,20,1,10]]},
    derivative:{title:'Độ dốc tại một điểm và diện tích phía sau',prompt:'Đổi x để xem tiếp tuyến, cát tuyến và diện tích. Đạo hàm là độ dốc tức thời; tích phân là cộng dồn.',controls:[['a','Hệ số a trong a·x²',-2,2,.5,1],['x','Điểm x',-3,3,.25,1],['h','Bước cát tuyến h',.1,2,.1,.5]]},
    logic:{title:'Bảng chân trị không phải bảng điểm',prompt:'Bật tắt p và q, chọn phép nối. Kiểm tra kết quả với dòng tương ứng trong bảng chân trị.',controls:[{key:'p',label:'Mệnh đề p',type:'toggle',value:true},{key:'q',label:'Mệnh đề q',type:'toggle',value:false},{key:'op',label:'Phép nối',type:'select',options:[['and','p AND q'],['or','p OR q'],['implies','p → q'],['xor','p XOR q']],value:'implies'}]},
    graph:{title:'Đường đi ngắn nhất trên một mạng nhỏ',prompt:'Đổi trọng số ba cạnh. So hai tuyến A–B–D và A–C–D trước khi xem tuyến ngắn nhất.',controls:[['ab','Cạnh A–B',1,9,1,3],['bd','Cạnh B–D',1,9,1,4],['cd','Cạnh C–D',1,9,1,6]]},
    readiness:{title:'Chẩn đoán đầu vào theo từng trụ cột',prompt:'Ba điểm dưới 100 và số giờ tự học mỗi tuần. Xem trụ cột yếu nhất thay vì chỉ nhìn điểm trung bình.',controls:[['math','Nền toán (%)',0,100,1,60],['python','Python (%)',0,100,1,50],['ml','ML/CV (%)',0,100,1,30],['hours','Giờ tự học mỗi tuần',0,20,1,6]]},
    tensor:{title:'Một batch ảnh chiếm bao nhiêu bộ nhớ?',prompt:'Ảnh RGB vuông. Đổi số ảnh, kích thước và kiểu số để thấy bộ nhớ tăng theo cả ba chiều.',controls:[['images','Số ảnh',1,2000,1,100],['size','Cạnh ảnh (pixel)',8,256,8,32],['channels','Số kênh',1,4,1,3],{key:'dtype',label:'Kiểu số',type:'select',options:[['float32','float32 · 4 byte'],['float64','float64 · 8 byte'],['uint8','uint8 · 1 byte']],value:'float32'}]},
    shape:{title:'Shape là hợp đồng trước khi tính',prompt:'Chọn phép toán rồi đổi ba kích thước. Hình dạng đầu ra phải khớp trước khi quan tâm giá trị.',controls:[['m','Số hàng m',1,6,1,2],['n','Số cột chung n',1,6,1,3],['k','Số cột k',1,6,1,4],{key:'op',label:'Phép toán',type:'select',options:[['matmul','A(m,n) @ B(n,k)'],['elementwise','A(m,n) + B(m,n)'],['broadcast','A(m,n) + B(1,n)']],value:'matmul'}]},
    torch:{title:'Một bước cập nhật có zero_grad hay không',prompt:'Tính tay đạo hàm rồi so với kết quả. Tắt zero_grad để thấy gradient cũ cộng dồn qua hai bước.',controls:[['w','Trọng số w',-3,3,.1,1],['x','Đầu vào x',-3,3,.5,2],['y','Mục tiêu y',-5,5,.5,5],['lr','Learning rate',.01,.5,.01,.1],{key:'zero',label:'Gọi zero_grad trước bước',type:'toggle',value:true}]},
    repro:{title:'Tái lập là một ngân sách chạy thử',prompt:'Số seed × số learning rate × số cấu hình. Đổi số phút mỗi lần chạy để thấy chi phí tái lập tăng nhanh.',controls:[['seeds','Số seed',1,10,1,3],['lrs','Số learning rate',1,6,1,2],['configs','Số cấu hình',1,8,1,2],['minutes','Phút mỗi lần chạy',1,120,1,12]]},
    branch:{title:'Chọn nhánh học theo tín hiệu phản hồi',prompt:'Có nhãn, có phần thưởng, có môi trường tương tác. Chọn nhánh phù hợp với tín hiệu thực tế, không theo tên mô hình.',controls:[['labeled','Tỉ lệ mẫu có nhãn (%)',0,100,1,20],{key:'reward',label:'Có tín hiệu phần thưởng',type:'toggle',value:false},{key:'environment',label:'Có môi trường để tương tác',type:'toggle',value:false}]},
    loss:{title:'Cùng một dự đoán, ba kiểu phạt',prompt:'Nhãn nhị phân, dự đoán là xác suất. Đổi kiểu loss để thấy cùng một sai lệch bị phạt khác nhau.',controls:[{key:'label',label:'Nhãn y = 1',type:'toggle',value:true},['pred','Dự đoán ŷ',.01,.99,.01,.8],{key:'kind',label:'Loss',type:'select',options:[['mse','MSE · (ŷ−y)²'],['mae','MAE · |ŷ−y|'],['bce','BCE · −[y ln ŷ + …]']],value:'bce'}]},
    sigmoid:{title:'Sigmoid và ngưỡng quyết định',prompt:'Đổi trọng số, bias và ngưỡng. Xác suất chỉ thành nhãn sau khi so với ngưỡng do người dùng chọn.',controls:[['w','Trọng số w',-4,4,.5,2],['b','Bias b',-4,4,.5,0],['x','Đầu vào x',-4,4,.5,1],['threshold','Ngưỡng quyết định',.1,.9,.05,.5]]},
    regularization:{title:'Độ phức tạp và dây cương regularization',prompt:'Tăng bậc đa thức để thấy overfit; tăng λ để kéo val loss xuống. Tìm vùng cân bằng thay vì tối thiểu train loss.',controls:[['degree','Bậc mô hình',1,9,1,7],['lambda','Hệ số λ',0,1,.05,0]]},
    momentum:{title:'Quán tính giúp qua vùng phẳng nhưng có thể vọt',prompt:'Cùng learning rate, thêm momentum. So quỹ đạo với đường loss và để ý dao động khi quán tính quá lớn.',controls:[['start','Điểm bắt đầu',-4,8,.5,0],['lr','Learning rate',.01,.8,.01,.15],['momentum','Momentum β',0,.99,.01,.8]]},
    leakage:{title:'Nhìn trộm test làm điểm đẹp giả tạo',prompt:'Tỉ lệ mẫu trùng giữa train và test, và thống kê chuẩn hóa có fit trên toàn bộ dữ liệu hay không. So điểm lạc quan với điểm trung thực.',controls:[['duplicate','Mẫu trùng giữa train/test (%)',0,50,1,20],['train','Tỉ lệ train (%)',50,90,5,70],{key:'fitAll',label:'Fit scaler trên toàn bộ dữ liệu',type:'toggle',value:true}]},
    neuron:{title:'Một neuron vẽ một đường ranh giới',prompt:'Đổi trọng số, bias và điểm đầu vào. Activation quyết định vùng nào được bật; đường ranh giới vẫn là tuyến tính.',controls:[['w1','Trọng số w₁',-3,3,.5,1],['w2','Trọng số w₂',-3,3,.5,1],['b','Bias b',-3,3,.5,-1],['x1','Điểm x₁',-3,3,.5,1],['x2','Điểm x₂',-3,3,.5,1],{key:'activation',label:'Activation',type:'select',options:[['relu','ReLU'],['sigmoid','Sigmoid'],['tanh','Tanh']],value:'relu'}]},
    batch:{title:'Batch size đổi số bước chứ không đổi dữ liệu',prompt:'Cùng một dataset và số epoch. Chọn batch size để thấy số bước mỗi epoch và số cập nhật thay đổi.',controls:[['dataset','Số mẫu train',100,5000,100,1000],['batch','Batch size',10,500,10,32],['epochs','Số epoch',1,30,1,10],['lr','Learning rate',.001,.1,.001,.01]]},
    normalize:{title:'Lan truyền phương sai qua nhiều tầng',prompt:'Khởi tạo quá nhỏ hoặc quá lớn làm tín hiệu co lại hoặc bùng nổ. Bật chuẩn hóa để đưa phương sai về quanh 1.',controls:[['init','Độ lớn khởi tạo',.1,3,.1,1],['depth','Số tầng',2,30,1,10],{key:'normalize',label:'Bật chuẩn hóa',type:'toggle',value:false}]},
    curves:{title:'Đọc khoảng cách train và validation',prompt:'Đổi khoảng cách và độ nhiễu của hai đường loss. Chẩn đoán overfit, underfit hay cân bằng từ hình dạng, không từ một con số.',controls:[['gap','Khoảng cách val − train',0,.8,.05,.15],['noise','Độ nhiễu của val',0,.3,.02,.05],['epochs','Số epoch',5,40,1,20]]},
    conv:{title:'Kernel trượt trên ảnh và volume đặc trưng',prompt:'Kéo cửa sổ kernel trên ảnh để xem nó lấy mẫu vùng nào, rồi đổi bộ lọc, padding và stride. Volume 3D xếp các feature map theo kênh.',controls:[['size','Cạnh ảnh vào',6,12,1,8],['kernel','Kernel K',1,5,2,3],['padding','Padding P',0,2,1,0],['stride','Stride S',1,2,1,1],['channels','Số kênh ra',1,4,1,3],{key:'filter',label:'Bộ lọc đang xem',type:'select',options:[['vertical','Cạnh dọc'],['edge','Cạnh / viền'],['blur','Làm mờ'],['identity','Giữ nguyên']],value:'vertical'}],extras:{kx:0,ky:0},prediction:{question:'Ảnh 8×8, kernel 3×3, padding 1, stride 1. Feature map đầu ra có kích thước:',options:[['eight','8×8'],['six','6×6'],['ten','10×10']],correct:'eight',explain:'out = (8 + 2×1 − 3)/1 + 1 = 8. Padding 1 bù đúng phần kernel lấn ra biên nên kích thước không đổi.'}},
    augment:{title:'Tăng cường dữ liệu và đóng băng backbone',prompt:'Tăng số biến thể mỗi ảnh và chọn tỉ lệ lớp được đóng băng. So lượng lượt học với số tham số phải cập nhật.',controls:[['dataset','Số ảnh train',100,10000,100,1000],['factor','Số biến thể mỗi ảnh',1,8,1,4],['frozen','Tỉ lệ tham số đóng băng (%)',0,100,5,80],['lr','Learning rate',.0001,.01,.0001,.001]]},
    softmax:{title:'Softmax đổi logit thành phân phối',prompt:'Ba logit và tỉ lệ lớp đa số. Xem xác suất từng lớp rồi so accuracy toàn cục với macro recall.',controls:[['z1','Logit lớp 1',-4,4,.5,2],['z2','Logit lớp 2',-4,4,.5,1],['z3','Logit lớp 3',-4,4,.5,0],['majority','Tỉ lệ lớp đa số (%)',40,100,1,95]]},
    iou:{title:'Hai hộp chồng nhau bao nhiêu?',prompt:'Kéo hộp dự đoán quanh hộp đáp án cố định. Tính giao, hợp và IoU trước khi kết luận đúng hay sai.',controls:[['x','Hộp dự đoán · x',0,4,.1,1.5],['y','Hộp dự đoán · y',0,4,.1,1.5],['w','Chiều rộng',1,4,.1,3],['h','Chiều cao',1,4,.1,3]]},
    probe:{title:'Đóng băng bao nhiêu tầng là hợp lý?',prompt:'Dữ liệu mới ít hay nhiều, đóng băng ít hay nhiều. Xem số tham số phải học và chiến lược gợi ý.',controls:[['frozen','Tỉ lệ tham số đóng băng (%)',0,100,5,80],['data','Số mẫu mới',100,100000,100,2000],['lr','Learning rate',.00001,.01,.00001,.001]]},
    context:{title:'Chi phí attention tăng theo bình phương độ dài',prompt:'Tăng số token, số chiều và số tầng. Quan sát FLOPs và bộ nhớ của ma trận attention tăng nhanh thế nào.',controls:[['tokens','Số token n',128,4096,128,1024],['dim','Số chiều d',128,1024,64,512],['layers','Số tầng',2,32,1,12]]},
    rounds:{title:'Một vòng FL gồm những khoảng thời gian nào?',prompt:'Đổi số client, số vòng và local epochs. Tách thời gian tính toán khỏi thời gian truyền thông.',controls:[['clients','Client mỗi vòng',2,100,1,20],['rounds','Số vòng',1,100,1,30],['local','Local epochs',1,10,1,3],['size','Kích thước mô hình (MB)',1,100,1,10]]},
    noniid:{title:'Dữ liệu lệch làm client trôi khác hướng',prompt:'Tăng mức không đồng nhất và số local epochs. Xem độ trôi proxy và độ phủ client; tăng sampling để bớt bỏ sót.',controls:[['heterogeneity','Mức không đồng nhất (%)',0,100,1,70],['local','Local epochs',1,20,1,5],['sampling','Tỉ lệ client được chọn (%)',10,100,5,50]]},
    dp:{title:'Nhiễu riêng tư đổi lấy độ hữu ích',prompt:'Giảm epsilon để riêng tư hơn; nhiễu tăng và độ hữu ích giảm. Đổi clipping để thấy trade-off.',controls:[['epsilon','Epsilon ε',.1,10,.1,1],['clip','Ngưỡng clipping C',.1,5,.1,1],['clients','Số client',10,1000,10,100]]},
    incremental:{title:'Ôn lại và ràng buộc giữ kiến thức',prompt:'Tăng bộ nhớ rehearsal hoặc regularization để giữ task cũ, nhưng có thể giảm khả năng học task mới. Tìm điểm cân bằng.',controls:[['replay','Bộ nhớ rehearsal (mẫu mỗi task)',0,200,5,50],['reg','Độ mạnh regularization',0,1,.05,.2],['similarity','Độ giống task cũ/mới (%)',0,100,1,60]]},
    clmetrics:{title:'Forgetting, BWT và ACC không phải một số',prompt:'Điểm task cũ trước và sau, điểm task mới. Một mô hình có thể học giỏi task mới nhưng quên nhiều task cũ.',controls:[['before','Task cũ · trước (%)',0,100,1,90],['after','Task cũ · sau (%)',0,100,1,65],['fresh','Task mới · sau (%)',0,100,1,85]]},
    memory:{title:'Bộ nhớ lưu lại và quyền riêng tư',prompt:'Số task × số mẫu mỗi task × byte mỗi mẫu. Tăng bộ nhớ giúp rehearsal nhưng tăng dữ liệu phải lưu và rủi ro riêng tư.',controls:[['tasks','Số task',2,20,1,8],['samples','Mẫu lưu mỗi task',10,1000,10,200],['bytes','Byte mỗi mẫu',4,512,4,64]]},
    pipeline:{title:'Một pipeline FL + CL gồm bao nhiêu cập nhật?',prompt:'Client × vòng × task × local epochs. Tách chi phí tính toán khỏi số vòng truyền thông để thấy nút thắt.',controls:[['clients','Client mỗi vòng',2,100,1,20],['rounds','Số vòng mỗi task',1,50,1,10],['tasks','Số task',1,20,1,5],['local','Local epochs',1,10,1,3]]},
    drift:{title:'Học nhiều ở client địa phương: lợi và hại',prompt:'Tăng local epochs và độ lệch dữ liệu để thấy drift tăng; thêm replay để kéo forgetting xuống. Không có cấu hình tốt cho mọi trường hợp.',controls:[['local','Local epochs',1,20,1,5],['shift','Độ lệch dữ liệu (%)',0,100,1,60],['replay','Tỉ lệ replay (%)',0,100,5,20]]},
    ablation:{title:'Ablation: bỏ một thành phần để biết nó có tác dụng',prompt:'Đổi baseline và mức giảm của ba thành phần. So từng biến thể với baseline thay vì chỉ nhìn mô hình đầy đủ.',controls:[['baseline','Điểm baseline (%)',50,95,1,80],['deltaA','Giảm khi bỏ A (điểm)',0,20,.5,4],['deltaB','Giảm khi bỏ B (điểm)',0,20,.5,7],['deltaC','Giảm khi bỏ C (điểm)',0,20,.5,2]]},
    baseline:{title:'So baseline phải so cả chi phí',prompt:'Một mô hình chính xác hơn có thể đắt hơn nhiều. Đổi accuracy, số tham số và latency để xem hiệu quả tương đối.',controls:[['accuracy','Accuracy (%)',50,99,1,85],['params','Tham số (triệu)',1,500,1,50],['latency','Latency (ms)',1,500,1,30],['split','Tỉ lệ test (%)',10,40,5,20]]},
    audit:{title:'Kiểm toán tái lập trước khi tin một con số',prompt:'Nhiều lần chạy và ít seed làm ước lượng bất định. Thêm kiểm tra để giảm nguy cơ báo cáo chọn lọc.',controls:[['runs','Số lần chạy',1,20,1,3],['variance','Độ lệch chuẩn giữa các lần',0,10,.5,3],['checks','Số kiểm tra đã làm',0,10,1,4],['seeds','Số seed dùng',1,10,1,3]]},
    checklist:{title:'Bảng kiểm trước khi báo cáo kết quả',prompt:'Bật các mục đã thực sự làm. Điểm cao không thay thế việc kiểm tra nội dung, nhưng cho thấy lỗ hổng quy trình.',controls:[{key:'split',label:'Đã tách train/validation/test',type:'toggle',value:true},{key:'seeds',label:'Đã chạy nhiều seed',type:'toggle',value:true},{key:'baseline',label:'Đã so baseline cùng chi phí',type:'toggle',value:false},{key:'ablation',label:'Đã làm ablation',type:'toggle',value:false},{key:'report',label:'Đã ghi lệnh và môi trường',type:'toggle',value:false}]},
  };
  Object.assign(definitions, extraDefinitions);
  const format = n => n===null?'Không xác định':(Math.abs(n)<1e-10?0:n).toLocaleString('vi-VN',{maximumFractionDigits:3});
  function controlInfo(control){
    if(Array.isArray(control))return {type:'range',key:control[0],label:control[1],min:control[2],max:control[3],step:control[4],value:control[5]};
    return {type:control.type||'range',...control};
  }
  function defaults(type){return Object.assign({},definitions[type].extras||{},Object.fromEntries(definitions[type].controls.map(control=>{const c=controlInfo(control);return [c.key,c.value];})));}
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
  function predictionResult(type,choice){
    const prediction=definitions[type]&&definitions[type].prediction;
    if(!prediction)return null;
    const answer=prediction.options.find(([value])=>value===prediction.correct);
    return {correct:choice===prediction.correct,answer:answer?answer[1]:prediction.correct,explain:prediction.explain};
  }
  function calculate(type,p){
    const custom=definitions[type];
    if(custom&&typeof custom.calculate==='function')return custom.calculate(p);
    switch(type){
      case 'linear':{const y=2*p.w+p.b;return {y,error:y-4,loss:(y-4)**2};}
      case 'gradient':return {x:p.x,loss:(p.x-3)**2,gradient:2*(p.x-3),next:p.x-p.rate*2*(p.x-3)};
      case 'bayes':{const prior=p.prior/100,s=p.sensitivity/100,spec=p.specificity/100,tp=10000*prior*s,fp=10000*(1-prior)*(1-spec);return {tp,fp,fn:10000*prior*(1-s),tn:10000*(1-prior)*spec,posterior:tp+fp>0?tp/(tp+fp):null};}
      case 'matrix':{
        const vx=p.vx??1,vy=p.vy??1,x=p.a*vx+p.b*vy,y=p.c*vx+p.d*vy,det=p.a*p.d-p.b*p.c,trace=p.a+p.d,disc=trace*trace-4*det,eigen=[];
        if(disc>=0){
          const root=Math.sqrt(disc),values=Math.abs(root)<1e-10?[trace/2]:[(trace+root)/2,(trace-root)/2];
          values.forEach(lambda=>{
            const row1=[p.a-lambda,p.b],row2=[p.c,p.d-lambda];
            let ex,ey;
            if(Math.hypot(...row1)>=Math.hypot(...row2)){ex=p.b;ey=lambda-p.a;}
            else {ex=lambda-p.d;ey=p.c;}
            if(Math.hypot(ex,ey)<1e-9){ex=p.b||1;ey=p.c||0;}
            const length=Math.hypot(ex,ey)||1;
            eigen.push({lambda,ex:ex/length,ey:ey/length});
          });
        }
        return {x,y,vx,vy,det,area:Math.abs(det),invertible:Math.abs(det)>1e-9,eigen};
      }
      case 'metrics':{const {tp,fp,fn,tn}=p,n=tp+fp+fn+tn;return {precision:tp+fp?tp/(tp+fp):null,recall:tp+fn?tp/(tp+fn):null,accuracy:n?(tp+tn)/n:null,f1:2*tp+fp+fn?2*tp/(2*tp+fp+fn):null};}
      case 'fedavg':{const n=p.na+p.nb;return {total:n,alpha:n?p.na/n:null,average:n?(p.na*p.wa+p.nb*p.wb)/n:null};}
      case 'forgetting':return {drop:p.before-p.old,average:(p.old+p.fresh)/2};
      case 'attention':{const l1=p.s1/Math.sqrt(p.dk),l2=p.s2/Math.sqrt(p.dk),m=Math.max(l1,l2),e1=Math.exp(l1-m),e2=Math.exp(l2-m),a=e1/(e1+e2);return {l1,l2,a,b:1-a};}
      case 'split':{const train=Math.floor(1000*p.train/100),validation=Math.floor(1000*p.validation/100);return {train,validation,test:1000-train-validation,valid:p.train+p.validation<100};}
      case 'cost':return {roundMB:2*p.size*p.clients,totalGB:2*p.size*p.clients*p.rounds/1000};
      default:return extraCalculate(type,p);
    }
  }
  function extraCalculate(type,p){
    switch(type){
      case 'formula':{const a=p.a,x=p.x;const value=p.mode==='square'?a*x*x:p.mode==='linear'?a*x:(x>=0?a:0);return {value,modeName:p.mode==='square'?'bình phương':p.mode==='linear'?'tuyến tính':'bậc thang',slope:p.mode==='linear'?a:p.mode==='square'?2*a*x:0};}
      case 'ratio':{const f=p.initial*Math.pow(1+p.rate/100,p.years);return {final:f,change:f-p.initial,multiple:f/p.initial,doubling:p.rate>0?Math.log(2)/Math.log(1+p.rate/100):null};}
      case 'derivative':{const f=p.a*p.x*p.x,df=2*p.a*p.x,secant=(p.a*(p.x+p.h)**2-f)/p.h;return {f,df,secant,area:p.a*p.x**3/3};}
      case 'logic':{const fn={and:(a,b)=>a&&b,or:(a,b)=>a||b,implies:(a,b)=>!a||b,xor:(a,b)=>a!==b}[p.op];const rows=[[false,false],[false,true],[true,false],[true,true]].map(([a,b])=>({a,b,value:fn(a,b)}));return {value:fn(p.p,p.q),trueCount:rows.filter(row=>row.value).length,rows};}
      case 'graph':{const p1=p.ab+p.bd,p2=2+p.cd;return {p1,p2,shortest:Math.min(p1,p2),path:p1<=p2?'A–B–D':'A–C–D',maxEdge:Math.max(p.ab,p.bd,2,p.cd)};}
      case 'readiness':{const weighted=.35*p.math+.35*p.python+.3*p.ml,boost=Math.min(10,p.hours)*1.5,final=Math.min(100,weighted+boost);const weakest=[['Toán',p.math],['Python',p.python],['ML/CV',p.ml]].sort((a,b)=>a[1]-b[1])[0];return {weighted,final,gap:100-final,weakest:weakest[0],weakestScore:weakest[1]};}
      case 'tensor':{const bytes={float32:4,float64:8,uint8:1}[p.dtype],elements=p.images*p.size*p.size*p.channels;return {elements,mb:elements*bytes/1e6,batches:Math.ceil(p.images/32),bytes};}
      case 'shape':{let shape='',valid=true,outElements=0,sample='';if(p.op==='matmul'){shape=`(${p.m}, ${p.k})`;outElements=p.m*p.k;let sum=0;for(let t=0;t<p.n;t++)sum+=t+1;sample=`${sum}`;}else if(p.op==='elementwise'){shape=`(${p.m}, ${p.n})`;outElements=p.m*p.n;sample='phần tử cùng vị trí cộng nhau';}else{shape=`(${p.m}, ${p.n})`;outElements=p.m*p.n;sample='mỗi hàng cộng vector (1,n)';}return {shape,valid,outElements,sample};}
      case 'torch':{const pred=p.w*p.x,loss=(pred-p.y)**2,grad=2*(pred-p.y)*p.x;return {pred,loss,grad,next:p.w-p.lr*grad,accumulated:grad*(p.zero?1:2),nextStale:p.w-p.lr*grad*(p.zero?1:2)};}
      case 'repro':{const runs=p.seeds*p.lrs*p.configs;return {runs,minutes:runs*p.minutes,storage:runs*25};}
      case 'branch':{const recommended=p.labeled>=20?'supervised':(p.environment&&p.reward?'reinforcement':'unsupervised');const reason=recommended==='supervised'?'Có đủ nhãn để học ánh xạ đầu vào → đầu ra.':recommended==='reinforcement'?'Không cần nhãn nhưng có môi trường và phần thưởng để thử hành động.':'Không có nhãn lẫn phần thưởng; tìm cấu trúc trong dữ liệu.';return {recommended,reason};}
      case 'loss':{const y=p.label?1:0,pred=p.pred;const loss=p.kind==='mse'?(pred-y)**2:p.kind==='mae'?Math.abs(pred-y):-(y*Math.log(pred)+(1-y)*Math.log(1-pred));return {y,pred,loss,brier:(pred-y)**2};}
      case 'sigmoid':{const z=p.w*p.x+p.b,prob=1/(1+Math.exp(-z));return {z,prob,label:prob>=p.threshold?1:0,margin:prob-p.threshold};}
      case 'regularization':{const train=.95/(1+.25*p.degree)+.02+.08*p.lambda;const raw=.35+.018*Math.pow(p.degree,1.8)+.25/(1+.5*p.degree);const val=raw*(1-.4*p.lambda)+.12*p.lambda;return {train,val,raw,gap:val-train};}
      case 'momentum':{let w=p.start,v=0;const path=[w];for(let i=0;i<12;i++){v=p.momentum*v+p.lr*2*(w-2);w-=v;path.push(w);}return {path,final:w,gap:Math.abs(w-2),max:Math.max(...path.map(Math.abs))};}
      case 'leakage':{const honest=.75,optimistic=Math.min(.99,honest+.2*p.duplicate/100+(p.fitAll?.03:0));return {honest,optimistic,gap:optimistic-honest,train:Math.round(1000*p.train/100),test:1000-Math.round(1000*p.train/100)};}
      case 'neuron':{const z=p.w1*p.x1+p.w2*p.x2+p.b;const a=p.activation==='relu'?Math.max(0,z):p.activation==='sigmoid'?1/(1+Math.exp(-z)):Math.tanh(z);const grad=p.activation==='relu'?(z>0?1:0):p.activation==='sigmoid'?a*(1-a):1-a*a;return {z,a,grad,label:a>=.5?1:0};}
      case 'batch':{const steps=Math.ceil(p.dataset/p.batch);return {steps,total:steps*p.epochs,seen:p.dataset*p.epochs,last:p.dataset-(steps-1)*p.batch};}
      case 'normalize':{const logVar=p.normalize?0:p.depth*Math.log(p.init);const std=Math.exp(logVar/2);return {std,logVar,status:std<.1?'co lại':std>10?'bùng nổ':'ổn định'};}
      case 'curves':{const train=[],val=[];for(let e=0;e<p.epochs;e++){const t=.15+.8*Math.exp(-e/5);train.push(t);val.push(t+p.gap+p.noise*Math.sin(e*1.7));}const last=train[train.length-1],lastVal=val[val.length-1];return {train,val,finalGap:lastVal-last,diagnosis:last>.55?'underfit':lastVal-last>.25?'overfit':'cân bằng'};}
      case 'conv':{
        const K=p.kernel,P=p.padding,S=p.stride,size=p.size,filters=['vertical','edge','blur','identity'],activeFilter=filters.includes(p.filter)?p.filter:'vertical';
        const input=Array.from({length:size},(_,y)=>Array.from({length:size},(_,x)=>{
          let value=1;
          if(x>=Math.floor(size*.32)&&x<Math.floor(size*.55)&&y>=1&&y<size-1)value=8;
          if(x>=Math.floor(size*.68)&&y<Math.floor(size*.42))value=Math.min(9,value+4);
          return value;
        }));
        const convolve=(kind)=>{
          const kernel=filterKernel(kind,K),out=Math.floor((size+2*P-K)/S)+1,map=[];
          for(let oy=0;oy<out;oy++){
            const row=[];
            for(let ox=0;ox<out;ox++){
              let sum=0;
              for(let ky=0;ky<K;ky++)for(let kx=0;kx<K;kx++){
                const iy=oy*S+ky-P,ix=ox*S+kx-P;
                if(iy>=0&&iy<size&&ix>=0&&ix<size)sum+=input[iy][ix]*kernel[ky][kx];
              }
              row.push(sum);
            }
            map.push(row);
          }
          return {kind,kernel,out,map,min:Math.min(...map.flat()),max:Math.max(...map.flat())};
        };
        const order=[activeFilter,...filters.filter(kind=>kind!==activeFilter)];
        const channelMaps=order.slice(0,p.channels).map(convolve),active=channelMaps[0];
        const maxK=Math.max(0,size-K),kx=clamp(Number.isFinite(p.kx)?p.kx:0,0,maxK),ky=clamp(Number.isFinite(p.ky)?p.ky:0,0,maxK);
        const patch=Array.from({length:Math.min(K,size)},(_,y)=>Array.from({length:Math.min(K,size)},(_,x)=>input[Math.min(size-1,ky+y)][Math.min(size-1,kx+x)]));
        let patchSum=0;for(let y=0;y<patch.length;y++)for(let x=0;x<patch[y].length;x++)patchSum+=patch[y][x]*(active.kernel[y]?.[x]??0);
        const out=active.out,pixels=Math.max(0,out)*Math.max(0,out)*p.channels;
        return {out,input,kernel:active.kernel,patch,patchSum,map:active.map,maps:channelMaps,kx,ky,min:active.min,max:active.max,paramsPerChannel:K*K+1,params:(K*K+1)*p.channels,pixels,ops:pixels*K*K};
      }
      case 'augment':{const effective=p.dataset*p.factor;return {effective,trainable:5e6*(100-p.frozen)/100,strategy:p.frozen>=80?'linear probe':p.frozen<=20?'fine-tune toàn bộ':'tinh chỉnh một phần'};}
      case 'softmax':{const m=Math.max(p.z1,p.z2,p.z3),e1=Math.exp(p.z1-m),e2=Math.exp(p.z2-m),e3=Math.exp(p.z3-m),sum=e1+e2+e3;const probs=[e1/sum,e2/sum,e3/sum];return {probs,top:probs.indexOf(Math.max(...probs))+1,accuracy:p.majority,macro:100/3};}
      case 'iou':{const gx=1,gy=1,gw=3,gh=3;const ix=Math.max(0,Math.min(p.x+p.w,gx+gw)-Math.max(p.x,gx)),iy=Math.max(0,Math.min(p.y+p.h,gy+gh)-Math.max(p.y,gy)),inter=ix*iy,union=p.w*p.h+gw*gh-inter;return {inter,union,iou:union>0?inter/union:null,pass:union>0&&inter/union>=.5};}
      case 'probe':{const trainable=5e6*(100-p.frozen)/100;return {trainable,strategy:p.frozen>=80?'linear probe':p.frozen<=20?'fine-tune toàn bộ':'tinh chỉnh một phần',recommendLr:p.frozen>=80?1e-3:1e-4};}
      case 'context':{const flops=p.layers*(4*p.tokens*p.tokens*p.dim+8*p.tokens*p.dim*p.dim)/1e9;return {flops,memory:p.tokens*p.tokens*p.layers*4/1e9,ratio:p.tokens/512};}
      case 'rounds':{const compute=p.rounds*p.local*2,wait=p.rounds*5,comm=2*p.size*p.clients*p.rounds;return {compute,wait,total:compute+wait,comm,coverage:p.clients*p.rounds};}
      case 'noniid':{const drift=p.heterogeneity*p.local/100;return {drift,coverage:p.sampling,risk:drift*(1-p.sampling/200)};}
      case 'dp':{const sigma=p.clip*Math.sqrt(2*Math.log(1.25/1e-5))/p.epsilon;return {sigma,utility:100/(1+sigma),noisePerClient:sigma/Math.sqrt(p.clients)};}
      case 'incremental':{const retention=Math.min(100,p.similarity*.45+p.replay*.25+p.reg*20),plasticity=Math.max(0,100-p.replay*.3-p.reg*30);return {retention,plasticity,balance:retention*.5+plasticity*.5};}
      case 'clmetrics':{const forgetting=p.before-p.after,bwt=p.after-p.before;return {forgetting,bwt,acc:(p.after+p.fresh)/2};}
      case 'memory':{const mb=p.tasks*p.samples*p.bytes/1e6;return {mb,exposure:p.tasks*p.samples,perTask:p.samples*p.bytes/1e6};}
      case 'pipeline':{const updates=p.clients*p.rounds*p.tasks*p.local,comm=2*10*p.clients*p.rounds*p.tasks;return {updates,comm,time:p.rounds*p.tasks*(p.local*2+5)};}
      case 'drift':{const drift=p.local*p.shift/100*(1-p.replay/100);return {drift,forgetting:drift*.6,stability:100-drift*.6,plasticity:100-drift*.4};}
      case 'ablation':{const variants=[['A',p.baseline-p.deltaA],['B',p.baseline-p.deltaB],['C',p.baseline-p.deltaC]].sort((a,b)=>a[1]-b[1]);return {variants,best:variants[0][0],maxDrop:Math.max(p.deltaA,p.deltaB,p.deltaC)};}
      case 'baseline':{const score=p.accuracy/(1+p.params/100+p.latency/100);return {score,perParam:p.accuracy/p.params,testN:Math.round(1000*p.split/100)};}
      case 'audit':{const ci=1.96*p.variance/Math.sqrt(p.runs),fdr=Math.max(0,100-p.checks*8-(p.seeds-1)*5),confidence=Math.min(100,100-ci*8+p.checks*3);return {ci,fdr,confidence};}
      case 'checklist':{const keys=['split','seeds','baseline','ablation','report'],done=keys.filter(key=>p[key]).length,score=done*20;return {done,score,ready:score>=80,missing:keys.filter(key=>!p[key])};}
      default:throw new Error('Unknown learning experiment: '+type);
    }
  }
  function filterKernel(kind,K){
    if(K===1)return [[1]];
    const kernel=Array.from({length:K},()=>Array(K).fill(0)),center=Math.floor(K/2);
    if(kind==='identity'){kernel[center][center]=1;return kernel;}
    if(kind==='blur'){for(let y=0;y<K;y++)for(let x=0;x<K;x++)kernel[y][x]=1/(K*K);return kernel;}
    if(kind==='vertical'){for(let y=0;y<K;y++)for(let x=0;x<K;x++)kernel[y][x]=x<center?-1:x>center?1:0;return kernel;}
    for(let y=0;y<K;y++)for(let x=0;x<K;x++)kernel[y][x]=y===center&&x===center?K*K-1:-1;
    return kernel;
  }
  const safe=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  let serial=0;
  function controlHTML(id,control){
    if(control.type==='select')return `<div class="experiment-control"><label for="${id}-${control.key}">${control.label}</label><div><select id="${id}-${control.key}" data-param="${control.key}">${control.options.map(([value,label])=>`<option value="${safe(value)}"${value===control.value?' selected':''}>${safe(label)}</option>`).join('')}</select></div></div>`;
    if(control.type==='toggle')return `<div class="experiment-control experiment-toggle"><label for="${id}-${control.key}"><input id="${id}-${control.key}" type="checkbox" data-param="${control.key}"${control.value?' checked':''}> ${control.label}</label></div>`;
    return `<div class="experiment-control"><label for="${id}-${control.key}">${control.label}</label><div><input id="${id}-${control.key}" type="range" min="${control.min}" max="${control.max}" step="${control.step}" value="${control.value}" data-param="${control.key}"><output for="${id}-${control.key}">${format(control.value)}</output></div></div>`;
  }
  function predictionHTML(type){
    const pred=definitions[type]&&definitions[type].prediction;
    if(!pred)return '';
    return `<div class="prediction-gate" data-prediction="${type}"><div class="prediction-kicker">Dự đoán trước khi chạy</div><p class="prediction-question">${pred.question}</p><div class="prediction-options">${pred.options.map(([value,label],index)=>`<button type="button" class="prediction-option" data-answer="${safe(value)}"><b>${String.fromCharCode(65+index)}.</b> ${safe(label)}</button>`).join('')}</div><p class="prediction-feedback" data-prediction-feedback role="status" aria-live="polite"></p></div>`;
  }
  function actionsHTML(type){
    const custom=definitions[type];
    if(custom&&typeof custom.actionsHTML==='function')return custom.actionsHTML();
    if(type==='gradient')return '<div class="lab-actions"><button type="button" class="lab-btn" data-step>Đi 1 bước</button><button type="button" class="lab-btn" data-run>Chạy 10 bước</button><button type="button" class="lab-btn" data-stop disabled>Tạm dừng</button></div><div class="rate-presets" aria-label="Learning rate nhanh"><span>η nhanh:</span><button type="button" data-rate="0.05">0,05</button><button type="button" data-rate="0.1">0,1</button><button type="button" data-rate="0.5">0,5</button><button type="button" data-rate="1.05">1,05</button></div>';
    if(type==='matrix')return '<div class="lab-actions"><button type="button" class="lab-btn" data-identity>Ma trận đồng nhất</button><button type="button" class="lab-btn" data-rotate>Xoay 30°</button></div>';
    return '';
  }
  function toolbarHTML(){
    return '<div class="lab-toolbar"><button type="button" class="lab-tool" data-snapshot>Lưu mốc A</button><button type="button" class="lab-tool" data-share>Chia sẻ</button><button type="button" class="lab-tool" data-export>Xuất phiếu</button><span class="lab-tool-status" data-tool-status role="status" aria-live="polite"></span></div>';
  }
  function challengeHTML(type){
    const challenge=definitions[type].challenge;
    if(!challenge)return '';
    return `<div class="lab-challenge"><div class="lab-challenge-copy"><span class="prediction-kicker">Thử thách</span><p>${safe(challenge.goal)}</p></div><button type="button" class="lab-btn" data-check-challenge>Kiểm tra mục tiêu</button><p class="lab-challenge-feedback" data-challenge-feedback role="status" aria-live="polite"></p></div>`;
  }
  function errorMuseumHTML(type){
    const errors=definitions[type].errors||[];
    if(!errors.length)return '';
    return `<details class="error-museum"><summary>Bảo tàng lỗi · ${errors.length} trạng thái sai có chủ đích</summary><p class="error-museum-intro">Chọn một trạng thái, đọc số liệu, rồi thử chẩn đoán trước khi mở lời giải thích.</p><div class="error-list">${errors.map((error,index)=>`<button type="button" data-error="${index}">${safe(error.label)}</button>`).join('')}</div><p class="error-note" data-error-note role="status" aria-live="polite"></p></details>`;
  }
  function html(type){
    const def=definitions[type];
    if(!def)return '<p class="learning-warning">Minh họa này chưa được hỗ trợ.</p>';
    const id='experiment-'+(++serial),gated=!!def.prediction;
    return `<div class="learning-experiment" data-experiment="${type}"><div class="experiment-head"><h3>${def.title}</h3><button type="button" class="lab-btn" data-reset>Đặt lại</button></div><p class="experiment-prompt">${def.prompt}</p>${toolbarHTML()}${predictionHTML(type)}<div class="experiment-stage" data-stage${gated?' hidden':''}>${challengeHTML(type)}<div class="experiment-body"><div class="experiment-visual" data-visual tabindex="0" aria-label="Vùng tương tác: kéo hoặc dùng bàn phím"></div><div class="experiment-controls">${def.controls.map(control=>controlHTML(id,controlInfo(control))).join('')}${actionsHTML(type)}</div></div><div class="experiment-results" data-results role="status" aria-live="polite" aria-atomic="true"></div><p class="experiment-observation" data-observation role="status" aria-live="polite" aria-atomic="true"></p><div class="snapshot-view" data-snapshot-view hidden></div>${errorMuseumHTML(type)}</div></div>`;
  }
  function svg(content,description){return `<svg viewBox="0 0 360 270" role="img" aria-label="${safe(description)}">${content}</svg>`;}
  function svgBox(content,description,width,height){return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${safe(description)}">${content}</svg>`;}
  function bars(entries,max=100){
    const width=value=>Math.max(0,Math.min(300,300*value/(max||1)));
    const chart=svg(entries.map(([name,value,color],i)=>`<text x="12" y="${30+i*52}" fill="#544b40" font-size="13">${safe(name)}</text><rect x="12" y="39.5" width="${width(value)}" height="16" rx="3" fill="${color}"><title>${safe(name)}: ${format(value)}</title></rect><text x="${Math.min(340,18+width(value))}" y="${52+i*52}" fill="#544b40" font-size="11">${format(value)}</text>`).join(''),entries.map(([n,v])=>n+': '+format(v)).join('; '));
    return `<div class="chart-wrap">${chart}<details class="lab-data"><summary>Bảng số liệu</summary><table><tbody>${entries.map(([name,value])=>`<tr><th scope="row">${safe(name)}</th><td>${format(value)}</td></tr>`).join('')}</tbody></table></details></div>`;
  }
  let chartSerial=0;
  function lineChart(series,options={}){
    const xMin=options.xMin??0,xMax=options.xMax??1,yMin=options.yMin??0,yMax=options.yMax??1;
    const px=x=>28+(x-xMin)/(xMax-xMin||1)*318,py=y=>245-(y-yMin)/(yMax-yMin||1)*214;
    const clip='clip-chart-'+(++chartSerial);
    const grid=[0,1,2,3,4].map(i=>`<line x1="28" y1="${31+i*53}" x2="346" y2="${31+i*53}" stroke="#e3ddd1"/><line x1="${28+i*79.5}" y1="31" x2="${28+i*79.5}" y2="245" stroke="#e3ddd1"/>`).join('');
    const paths=series.map(item=>`<path d="${item.points.map(([x,y],i)=>(i?'L':'M')+px(x).toFixed(1)+' '+py(y).toFixed(1)).join(' ')}" fill="none" stroke="${item.color||'#1f6f5f'}" stroke-width="${item.width||2.5}" ${item.dash?'stroke-dasharray="6 4"':''}/>`).join('');
    const markers=(options.markers||[]).map(([x,y,color])=>`<circle cx="${px(x)}" cy="${py(y)}" r="5" fill="${color||'#ad542f'}"/>`).join('');
    const guide=options.guide?`<path d="M${px(options.guide[0])} ${py(options.guide[1])} H${px(options.guide[2])}" stroke="#9e7a31" stroke-dasharray="4 3"/>`:'' ;
    return svg(`<defs><clipPath id="${clip}"><rect x="28" y="20" width="318" height="225"/></clipPath></defs>${grid}<g clip-path="url(#${clip})">${paths}${markers}${guide}</g><path d="M28 245 H346" stroke="#a89c8b"/><text x="30" y="16" font-size="12" fill="#6f675d">${safe(options.title||'')}</text><text x="28" y="264" font-size="11" fill="#6f675d">${safe(options.xLabel||'')}</text>`,series.map(item=>item.name||'').join(', '));
  }
  function gridMatrix(values,options={}){
    const rows=values.length,cols=Math.max(...values.map(row=>row.length),1),cell=Math.min(38,210/Math.max(rows,cols)),x0=180-cols*cell/2,y0=138-rows*cell/2;
    let body='';values.forEach((row,i)=>row.forEach((value,j)=>{body+=`<rect x="${x0+j*cell}" y="${y0+i*cell}" width="${cell-2}" height="${cell-2}" rx="3" fill="${options.highlight&&options.highlight[0]===i&&options.highlight[1]===j?'#f0d9c8':'#f6f1e8'}" stroke="#d9d0c2"/><text x="${x0+j*cell+cell/2-1}" y="${y0+i*cell+cell/2+4}" text-anchor="middle" font-size="${Math.min(13,cell/2.6)}" fill="#544b40">${safe(value)}</text>`;}));
    return svg(`${body}<text x="12" y="20" font-size="12" fill="#6f675d">${safe(options.title||'')}</text><text x="12" y="266" font-size="11" fill="#6f675d">${safe(options.note||'')}</text>`,options.title||'Lưới giá trị');
  }
  function truthTable(rows,p,q,op){
    const names={and:'p AND q',or:'p OR q',implies:'p → q',xor:'p XOR q'};
    let body='<text x="99" y="52" text-anchor="middle" font-size="13" fill="#6f675d">p</text><text x="169" y="52" text-anchor="middle" font-size="13" fill="#6f675d">q</text><text x="254" y="52" text-anchor="middle" font-size="13" fill="#6f675d">kết quả</text>';
    rows.forEach((row,i)=>{const active=row.a===p&&row.b===q;body+=`<rect x="28" y="${62+i*40}" width="304" height="38" rx="4" fill="${active?'#ead1bf':'#faf8f3'}" stroke="#e3ddd1"/><text x="99" y="${87+i*40}" text-anchor="middle" font-size="15">${row.a?'Đ':'S'}</text><text x="169" y="${87+i*40}" text-anchor="middle" font-size="15">${row.b?'Đ':'S'}</text><text x="254" y="${87+i*40}" text-anchor="middle" font-size="15" font-weight="700" fill="${row.value?'#1f6f5f':'#ad542f'}">${row.value?'Đ':'S'}</text>`;});
    return svg(`${body}<text x="12" y="24" font-size="13" fill="#6f675d">${names[op]||op}</text><text x="12" y="264" font-size="11" fill="#6f675d">Đ = đúng, S = sai; dòng tô đậm là p, q đang chọn.</text>`, `Bảng chân trị ${names[op]||op}`);
  }
  const nodes={A:[58,64],B:[172,64],C:[120,210],D:[300,210]};
  function networkDiagram(p,r){
    const edge=(a,b,w,on)=>`<line x1="${nodes[a][0]}" y1="${nodes[a][1]}" x2="${nodes[b][0]}" y2="${nodes[b][1]}" stroke="${on?'#1f6f5f':'#b5ac9e'}" stroke-width="${on?5:3}"/><text x="${(nodes[a][0]+nodes[b][0])/2}" y="${(nodes[a][1]+nodes[b][1])/2-7}" text-anchor="middle" font-size="12" fill="#6f675d">${w}</text>`;
    const on1=r.path==='A–B–D',on2=!on1;
    return svg(`${edge('A','B',p.ab,on1)}${edge('B','D',p.bd,on1)}${edge('A','C',2,on2)}${edge('C','D',p.cd,on2)}${Object.entries(nodes).map(([name,[x,y]])=>`<circle cx="${x}" cy="${y}" r="19" fill="#f6f1e8" stroke="#1f6f5f" stroke-width="2"/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="15" font-weight="700" fill="#1f6f5f">${name}</text>`).join('')}<text x="12" y="24" font-size="12" fill="#6f675d">Tuyến ngắn nhất: ${r.path} = ${format(r.shortest)}</text><text x="12" y="264" font-size="11" fill="#6f675d">Cạnh A–C cố định bằng 2; các số khác do thanh trượt quyết định.</text>`,`Mạng A, B, C, D; tuyến ngắn nhất ${r.path}`);
  }
  function boxDiagram(p,r){
    const scale=43,x0=26,y0=22,px=x=>x0+x*scale,py=y=>y0+(6-y)*scale;
    const rect=(x,y,w,h,color,dash)=>`<rect x="${px(x)}" y="${py(y+h)}" width="${w*scale}" height="${h*scale}" fill="${color}" fill-opacity=".18" stroke="${color}" stroke-width="2" ${dash?'stroke-dasharray="5 4"':''}/>`;
    const ix=Math.max(0,Math.min(p.x+p.w,4)-Math.max(p.x,1)),iy=Math.max(0,Math.min(p.y+p.h,4)-Math.max(p.y,1)),ix0=Math.max(p.x,1),iy0=Math.max(p.y,1);
    let grid='';for(let i=0;i<=6;i++)grid+=`<line x1="${px(0)}" y1="${py(i)}" x2="${px(6)}" y2="${py(i)}" stroke="#e3ddd1"/><line x1="${px(i)}" y1="${py(0)}" x2="${px(i)}" y2="${py(6)}" stroke="#e3ddd1"/>`;
    return svg(`${grid}${rect(1,1,3,3,'#1f6f5f')}${rect(p.x,p.y,p.w,p.h,'#ad542f',true)}${ix>0&&iy>0?`<rect x="${px(ix0)}" y="${py(iy0+iy)}" width="${ix*scale}" height="${iy*scale}" fill="#1f6f5f" fill-opacity=".35"/>`:''}<text x="12" y="18" font-size="12" fill="#6f675d">Xanh: đáp án; nét đứt: dự đoán</text><text x="12" y="265" font-size="12" fill="#6f675d">IoU = ${r.iou===null?'—':format(r.iou)} · ${r.pass?'đạt ngưỡng 0,5':'dưới ngưỡng 0,5'}</text>`,`Hộp đáp án và hộp dự đoán, giao diện tích ${format(r.inter)}`);
  }
  function flowDiagram(steps,active=-1){
    const width=302/Math.max(steps.length,1),body=steps.map((step,i)=>{const x=29+i*width;return `<rect x="${x}" y="88" width="${width-12}" height="76" rx="7" fill="${i===active?'#ead1bf':'#f6f1e8'}" stroke="${i===active?'#ad542f':'#b5ac9e'}"/><text x="${x+(width-12)/2}" y="118" text-anchor="middle" font-size="12" fill="#544b40">${safe(step[0])}</text><text x="${x+(width-12)/2}" y="140" text-anchor="middle" font-size="14" font-weight="700" fill="#1f6f5f">${safe(step[1])}</text>${i<steps.length-1?`<path d="M${x+width-11} 126 H${x+width-1}" stroke="#9e7a31" marker-end="url(#arrow-lab)"/>`:''}`;}).join('');
    return svg(`<defs><marker id="arrow-lab" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill="#9e7a31"/></marker></defs>${body}<text x="12" y="38" font-size="13" fill="#6f675d">Một đường tính, không phải một bảng số rời rạc</text><text x="12" y="264" font-size="11" fill="#6f675d">Thay thanh trượt để xem con số nào thay đổi.</text>`,`Sơ đồ ${steps.map(step=>step[0]).join(' → ')}`);
  }
  function extraPlot(type,p,r){
    switch(type){
      case 'formula':{const points=[];for(let i=0;i<=80;i++){const x=-4+8*i/80,a=p.a;points.push([x,p.mode==='square'?a*x*x:p.mode==='linear'?a*x:(x>=0?a:0)]);}const ys=points.map(pt=>pt[1]);return lineChart([{name:'f(x)',points,color:'#1f6f5f'}],{xMin:-4,xMax:4,yMin:Math.min(0,...ys)-2,yMax:Math.max(1,...ys)+2,title:'f(x) theo x',xLabel:'x từ −4 đến 4',markers:[[p.x,r.value,'#ad542f']]});}
      case 'ratio':{const points=[];for(let y=0;y<=20;y++)points.push([y,p.initial*Math.pow(1+p.rate/100,y)]);return lineChart([{name:'giá trị',points,color:'#1f6f5f'}],{xMin:0,xMax:20,yMin:0,yMax:Math.max(...points.map(pt=>pt[1]),1)*1.05,title:'Tăng theo lãi kép',xLabel:'năm',markers:[[p.years,r.final,'#ad542f']]});}
      case 'derivative':{let curve='';for(let i=0;i<=80;i++){const x=-3+6*i/80,y=p.a*x*x;curve+=(i?'L':'M')+(28+(x+3)/6*318).toFixed(1)+' '+(245-(y+10)/30*214).toFixed(1);}const px=x=>28+(x+3)/6*318,py=y=>245-(y+10)/30*214;const t1=p.x-2,t2=p.x+2;return svg(`<path d="${curve}" stroke="#1f6f5f" stroke-width="3" fill="none"/><path d="M${px(t1)} ${py(r.f+r.df*(t1-p.x))} L${px(t2)} ${py(r.f+r.df*(t2-p.x))}" stroke="#ad542f" stroke-width="2"/><path d="M${px(p.x)} ${py(r.f)} L${px(p.x+p.h)} ${py(r.f+r.secant*p.h)}" stroke="#9e7a31" stroke-dasharray="5 4"/><circle cx="${px(p.x)}" cy="${py(r.f)}" r="5" fill="#ad542f"/><text x="12" y="20" font-size="12" fill="#6f675d">Tiếp tuyến đỏ; cát tuyến vàng; vùng tích phân từ 0 đến x: ${format(r.area)}</text>`, `Đạo hàm ${format(r.df)}, diện tích ${format(r.area)}`);}
      case 'logic':return truthTable(r.rows,p.p,p.q,p.op);
      case 'graph':return networkDiagram(p,r);
      case 'readiness':return bars([['Toán',p.math,'#1f6f5f'],['Python',p.python,'#2f7d73'],['ML/CV',p.ml,'#ad542f'],['Sẵn sàng',r.final,'#9e7a31']]);
      case 'tensor':return bars([['Phần tử',r.elements,'#1f6f5f'],['MB ×10⁶',r.mb*1e6,'#ad542f'],['Batch 32',r.batches,'#9e7a31']],Math.max(r.elements,r.mb*1e6,r.batches,1));
      case 'shape':{const values=Array.from({length:p.m},(_,i)=>Array.from({length:p.op==='matmul'?p.k:p.n},(_,j)=>p.op==='matmul'?p.n*(i+j+1):i+j+1));return gridMatrix(values,{title:'Đầu ra '+r.shape,note:'Mỗi ô là một vị trí; giá trị minh họa, không phải dữ liệu thật.',highlight:[0,0]});}
      case 'torch':return flowDiagram([['dự đoán',format(r.pred)],['loss',format(r.loss)],['gradient',format(r.accumulated)],['w mới',format(r.nextStale)]],p.zero?3:2);
      case 'repro':return bars([['Số lần chạy',r.runs,'#1f6f5f'],['Giờ tính',r.minutes/60,'#ad542f'],['GB checkpoint',r.storage/1000,'#9e7a31']],Math.max(r.runs,r.minutes/60,r.storage/1000,1));
      case 'branch':return flowDiagram([['có nhãn',p.labeled+'%'],['học có giám sát',p.labeled>=20?'chọn':'không đủ'],['phần thưởng',p.reward?'có':'không'],['học tăng cường',p.environment&&p.reward?'chọn':'không đủ'],['học không giám sát',p.labeled<20&&!p.reward?'chọn':'dự phòng']],p.labeled>=20?1:(p.environment&&p.reward?3:4));
      case 'loss':{const points=[];for(let i=1;i<100;i++){const pred=i/100,y=p.label?1:0,loss=p.kind==='mse'?(pred-y)**2:p.kind==='mae'?Math.abs(pred-y):-(y*Math.log(pred)+(1-y)*Math.log(1-pred));points.push([pred,loss]);}return lineChart([{name:'loss',points,color:'#1f6f5f'}],{xMin:0,xMax:1,yMin:0,yMax:5,title:'Loss theo dự đoán ŷ',xLabel:'ŷ từ 0,01 đến 0,99',markers:[[p.pred,r.loss,'#ad542f']]});}
      case 'sigmoid':{const points=[];for(let i=0;i<=100;i++){const z=-6+12*i/100;points.push([z,1/(1+Math.exp(-z))]);}return lineChart([{name:'sigmoid',points,color:'#1f6f5f'}],{xMin:-6,xMax:6,yMin:0,yMax:1,title:'σ(z) và ngưỡng quyết định',xLabel:'z = wx + b',markers:[[r.z,r.prob,'#ad542f']],guide:[-6,p.threshold,6]});}
      case 'regularization':{const train=[],val=[];for(let d=1;d<=9;d++){train.push([d,.95/(1+.25*d)+.02+.08*p.lambda]);const raw=.35+.018*Math.pow(d,1.8)+.25/(1+.5*d);val.push([d,raw*(1-.4*p.lambda)+.12*p.lambda]);}return lineChart([{name:'train',points:train,color:'#1f6f5f'},{name:'validation',points:val,color:'#ad542f'}],{xMin:1,xMax:9,yMin:0,yMax:2,title:'Train và validation theo bậc mô hình',xLabel:'bậc đa thức',markers:[[p.degree,r.train,'#1f6f5f'],[p.degree,r.val,'#ad542f']]});}
      case 'momentum':{const curve=[];for(let i=0;i<=80;i++){const w=-4+12*i/80;curve.push([w,(w-2)**2]);}const path=r.path.map(w=>[w,(w-2)**2]);return lineChart([{name:'loss',points:curve,color:'#b5ac9e'},{name:'quỹ đạo',points:path,color:'#ad542f'}],{xMin:-4,xMax:8,yMin:0,yMax:40,title:'Quỹ đạo trên hàm (w−2)²',xLabel:'w',markers:[[r.final,(r.final-2)**2,'#1f6f5f']]});}
      case 'leakage':return bars([['Trung thực',100*r.honest,'#1f6f5f'],['Lạc quan',100*r.optimistic,'#ad542f'],['Khoảng cách',100*r.gap,'#9e7a31']]);
      case 'neuron':{const px=x=>28+(x+3)/6*318,py=y=>245-(y+3)/6*214;const points=[[-4,(-p.b-p.w1*-4)/p.w2],[4,(-p.b-p.w1*4)/p.w2]].filter(pt=>Number.isFinite(pt[1]));let line='';if(points.length===2)line=`<line x1="${px(points[0][0])}" y1="${py(points[0][1])}" x2="${px(points[1][0])}" y2="${py(points[1][1])}" stroke="#1f6f5f" stroke-width="2" stroke-dasharray="6 4"/>`;return svg(`<path d="M28 138 H346 M180 31 V245" stroke="#b5ac9e"/>${line}<circle cx="${px(p.x1)}" cy="${py(p.x2)}" r="6" fill="${r.label?'#ad542f':'#9e7a31'}"/><text x="12" y="20" font-size="12" fill="#6f675d">Điểm (${format(p.x1)}; ${format(p.x2)}) · z=${format(r.z)} · a=${format(r.a)}</text><text x="12" y="265" font-size="11" fill="#6f675d">Nét đứt là z = 0; activation chỉ đổi cách tô màu, không đổi ranh giới tuyến tính.</text>`, `Neuron với đường ranh giới z = 0 và điểm đầu vào`);
      }
      case 'batch':return bars([['Bước/epoch',r.steps,'#1f6f5f'],['Cập nhật',r.total,'#ad542f'],['Nghìn mẫu thấy',r.seen/1000,'#9e7a31']]);
      case 'normalize':{const points=[];for(let d=1;d<=30;d++){const std=p.normalize?1:Math.exp(d*Math.log(p.init)/2);points.push([d,Math.min(100,std)]);}return lineChart([{name:'std',points,color:'#1f6f5f'}],{xMin:1,xMax:30,yMin:0,yMax:100,title:'Độ lệch chuẩn của activation',xLabel:'số tầng',markers:[[p.depth,Math.min(100,r.std),'#ad542f']]});}
      case 'curves':return lineChart([{name:'train',points:r.train.map((v,i)=>[i,v]),color:'#1f6f5f'},{name:'validation',points:r.val.map((v,i)=>[i,v]),color:'#ad542f'}],{xMin:0,xMax:p.epochs-1,yMin:0,yMax:Math.max(1.5,...r.train,...r.val)+.1,title:'Hai đường loss',xLabel:'epoch'});
      case 'augment':return bars([['Lượt ảnh',r.effective,'#1f6f5f'],['Ảnh gốc',p.dataset,'#9e7a31'],['Tham số học (triệu)',r.trainable/1e6,'#ad542f']],Math.max(r.effective,p.dataset,r.trainable/1e6,1));
      case 'softmax':return bars([['Lớp 1',100*r.probs[0],'#1f6f5f'],['Lớp 2',100*r.probs[1],'#2f7d73'],['Lớp 3',100*r.probs[2],'#9e7a31'],['Accuracy',r.accuracy,'#ad542f']]);
      case 'iou':return boxDiagram(p,r);
      case 'probe':return bars([['Tham số học (triệu)',r.trainable/1e6,'#1f6f5f'],['Dữ liệu (nghìn)',p.data/1000,'#ad542f'],['LR ×10⁴',p.lr*1e4,'#9e7a31']],Math.max(r.trainable/1e6,p.data/1000,p.lr*1e4,1));
      case 'context':{const points=[];for(let n=128;n<=4096;n+=128)points.push([n,p.layers*(4*n*n*p.dim+8*n*p.dim*p.dim)/1e9]);const max=Math.max(1,...points.map(pt=>pt[1]));return lineChart([{name:'GFLOPs',points,color:'#1f6f5f'}],{xMin:0,xMax:4096,yMin:0,yMax:max*1.05,title:'FLOPs attention theo số token',xLabel:'token',markers:[[p.tokens,r.flops,'#ad542f']]});}
      case 'rounds':return bars([['Tính toán (phút)',r.compute,'#1f6f5f'],['Chờ/tổng hợp',r.wait,'#9e7a31'],['Truyền (×10 MB)',r.comm/10,'#ad542f'],['Client-vòng',r.coverage,'#7a8b63']],Math.max(r.compute,r.wait,r.comm/10,r.coverage,1));
      case 'noniid':return bars([['Drift proxy',r.drift,'#ad542f'],['Rủi ro',r.risk,'#9e7a31'],['Độ phủ client',r.coverage,'#1f6f5f']]);
      case 'dp':return bars([['Nhiễu σ',r.sigma,'#ad542f'],['Hữu ích',r.utility,'#1f6f5f'],['Nhiễu/client',r.noisePerClient,'#9e7a31']],Math.max(r.sigma,r.utility,r.noisePerClient,1));
      case 'incremental':return bars([['Giữ kiến thức',r.retention,'#1f6f5f'],['Học mới',r.plasticity,'#ad542f'],['Cân bằng',r.balance,'#9e7a31']]);
      case 'clmetrics':return bars([['Trước',p.before,'#7a8b63'],['Sau',p.after,'#1f6f5f'],['Task mới',p.fresh,'#ad542f']]);
      case 'memory':return bars([['MB phải lưu',r.mb,'#ad542f'],['Mẫu lưu (nghìn)',r.exposure/1000,'#9e7a31'],['MB/task',r.perTask,'#1f6f5f']],Math.max(r.mb,r.exposure/1000,r.perTask,1));
      case 'pipeline':return bars([['Cập nhật địa phương',r.updates,'#1f6f5f'],['Truyền (×10 MB)',r.comm/10,'#ad542f'],['Phút',r.time,'#9e7a31']],Math.max(r.updates,r.comm/10,r.time,1));
      case 'drift':return bars([['Drift',r.drift,'#ad542f'],['Forgetting',r.forgetting,'#9e7a31'],['Ổn định',r.stability,'#1f6f5f'],['Học mới',r.plasticity,'#7a8b63']]);
      case 'ablation':{const entries=[['Baseline',p.baseline,'#7a8b63']].concat(r.variants.map(([name,value],i)=>['Bỏ '+name,value,['#ad542f','#9e7a31','#1f6f5f'][i]]));return bars(entries,100);}
      case 'baseline':return bars([['Accuracy',p.accuracy,'#1f6f5f'],['Tham số (triệu)',p.params,'#ad542f'],['Latency (ms)',p.latency,'#9e7a31'],['Điểm hiệu quả',r.score,'#7a8b63']]);
      case 'audit':return bars([['CI ±',r.ci,'#ad542f'],['Tự tin',r.confidence,'#1f6f5f'],['Nguy cơ chọn lọc',r.fdr,'#9e7a31']]);
      case 'checklist':{const keys=[['split','Tách tập'],['seeds','Nhiều seed'],['baseline','Baseline'],['ablation','Ablation'],['report','Lệnh/môi trường']];return bars(keys.map(([key,label],i)=>[label,p[key]?20:0,p[key]?'#1f6f5f':'#ad542f']),20);}
      default:return '';
    }
  }
  function extraDescribe(type,p,r,steps){
    const f=format;
    switch(type){
      case 'formula':return [[['Dạng',r.modeName],['Giá trị f(x)',f(r.value)],['Độ dốc tại x',f(r.slope)]],p.mode==='square'?`Đọc thành lời: lấy x bình phương, nhân với ${f(p.a)}. Với x = ${f(p.x)}, kết quả là ${f(p.a)} × ${f(p.x)}² = ${f(r.value)}.`:p.mode==='linear'?`Đọc thành lời: nhân x với ${f(p.a)}. Với x = ${f(p.x)}, kết quả là ${f(r.value)}.`:`Đọc thành lời: nếu x không âm thì lấy ${f(p.a)}, ngược lại lấy 0. Với x = ${f(p.x)}, kết quả là ${f(r.value)}.`];
      case 'ratio':return [[['Giá trị sau kỳ hạn',f(r.final)],['Mức tăng tuyệt đối',f(r.change)],['Số lần so với đầu',f(r.multiple)],['Số năm để gấp đôi',r.doubling===null?f(null):f(r.doubling)]],`Công thức là ${f(p.initial)} × (1 + ${f(p.rate)}%)^${p.years} = ${f(r.final)}. Tăng ${f(p.rate)}% mỗi năm không có nghĩa sau 10 năm tăng ${f(10*p.rate)}%; lãi kép tính trên giá trị mới.`];
      case 'derivative':return [[['f(x)',f(r.f)],['Đạo hàm f′(x)',f(r.df)],['Độ dốc cát tuyến',f(r.secant)],['Diện tích từ 0 đến x',f(r.area)]],`Tiếp tuyến tại x = ${f(p.x)} có độ dốc ${f(r.df)}. Cát tuyến qua x và x+h có độ dốc ${f(r.secant)}; khi h nhỏ, cát tuyến tiến về tiếp tuyến. Tích phân chỉ bằng diện tích có dấu khi hàm không đổi dấu trên đoạn.`];
      case 'logic':return [[['p',p.p?'Đúng':'Sai'],['q',p.q?'Đúng':'Sai'],['Kết quả',r.value?'Đúng':'Sai'],['Số dòng đúng',`${r.trueCount}/4`]],`Với p = ${p.p?'đúng':'sai'} và q = ${p.q?'đúng':'sai'}, phép ${p.op} cho ${r.value?'đúng':'sai'}. Bảng chân trị liệt kê đủ bốn tổ hợp; một dòng đúng không chứng minh cả quy tắc.`];
      case 'graph':return [[['Tuyến A–B–D',f(r.p1)],['Tuyến A–C–D',f(r.p2)],['Đường ngắn nhất',f(r.shortest)]],`Tuyến ngắn nhất là ${r.path} với tổng trọng số ${f(r.shortest)}. Đổi một cạnh có thể đổi cả tuyến; đường ngắn nhất không nhất thiết đi qua ít đỉnh nhất.`];
      case 'readiness':return [[['Điểm có trọng số',f(r.weighted)],['Thưởng giờ tự học',f(r.final-r.weighted)],['Điểm sẵn sàng',f(r.final)],['Trụ cột yếu nhất',`${r.weakest} (${f(r.weakestScore)})`]],`Trụ cột yếu nhất là ${r.weakest} với ${f(r.weakestScore)}/100. Giờ tự học chỉ thêm tối đa 15 điểm và không thay thế nền tảng; hãy xử lý trụ cột yếu trước khi tăng thời lượng.`];
      case 'tensor':return [[['Số phần tử',f(r.elements)],['Bộ nhớ',f(r.mb)+' MB'],['Số batch size 32',f(r.batches)],['Byte mỗi phần tử',f(r.bytes)]],`${p.images} × ${p.size} × ${p.size} × ${p.channels} = ${f(r.elements)} phần tử; mỗi phần tử ${r.bytes} byte nên batch chiếm ${f(r.mb)} MB. Đây mới là dữ liệu vào, chưa tính activation, gradient và optimizer state.`];
      case 'shape':return [[['Shape đầu ra',r.shape],['Số phần tử',f(r.outElements)],['Hợp lệ',r.valid?'Có':'Không'],['Ghi chú',r.sample]],`Với ${p.op}, shape đầu ra là ${r.shape}. Kiểm tra shape trước khi chạy giúp phát hiện lỗi sớm; phép nhân ma trận yêu cầu số cột của A bằng số hàng của B.`];
      case 'torch':return [[['Dự đoán',f(r.pred)],['Loss bình phương',f(r.loss)],['Gradient một bước',f(r.grad)],['Gradient cộng dồn',f(r.accumulated)],['w sau cập nhật',f(r.nextStale)]],`pred = ${f(p.w)} × ${f(p.x)} = ${f(r.pred)}; loss = (${f(r.pred)} − ${f(p.y)})² = ${f(r.loss)}. Gradient = 2(pred − y)x = ${f(r.grad)}. ${p.zero?'Có zero_grad nên bước này dùng gradient mới.':'Không zero_grad: gradient bước trước cộng vào, nên bước cập nhật dùng '+f(r.accumulated)+' thay vì '+f(r.grad)+'.'} Đây là minh họa một tham số, không phải một lần train đầy đủ.`];
      case 'repro':return [[['Tổng số lần chạy',f(r.runs)],['Tổng thời gian',f(r.minutes)+' phút'],['Dung lượng checkpoint',f(r.storage)+' MB']],`${p.seeds} seed × ${p.lrs} learning rate × ${p.configs} cấu hình = ${f(r.runs)} lần chạy. Tái lập không chỉ là đặt seed; cần ghi phiên bản thư viện, phần cứng và lệnh chạy.`];
      case 'branch':return [[['Có nhãn',f(p.labeled)+'%'],['Nhánh gợi ý',r.recommended],['Lý do',r.reason]],`Với ${f(p.labeled)}% mẫu có nhãn, ${p.reward?'có':'không có'} phần thưởng và ${p.environment?'có':'không có'} môi trường tương tác, nhánh phù hợp là ${r.recommended}. Tên mô hình không quyết định nhánh; tín hiệu học mới quyết định.`];
      case 'loss':return [[['Nhãn y',f(r.y)],['Dự đoán ŷ',f(r.pred)],['Giá trị loss',f(r.loss)],['Brier (ŷ−y)²',f(r.brier)]],`Với y = ${f(r.y)} và ŷ = ${f(r.pred)}, loss ${p.kind.toUpperCase()} là ${f(r.loss)}. Cùng một dự đoán bị phạt khác nhau tùy hàm loss; BCE phạt rất nặng khi dự đoán tự tin sai.`];
      case 'sigmoid':return [[['z = wx + b',f(r.z)],['Xác suất σ(z)',f(100*r.prob)+'%'],['Nhãn sau ngưỡng',String(r.label)],['Biên so với ngưỡng',f(r.margin)]],`z = ${f(p.w)} × ${f(p.x)} + ${f(p.b)} = ${f(r.z)}; σ(z) = ${f(100*r.prob)}%. Ngưỡng ${f(p.threshold)} cho nhãn ${r.label}. Xác suất không phải nhãn; ngưỡng thấp tăng recall nhưng cũng tăng báo động sai.`];
      case 'regularization':return [[['Train loss',f(r.train)],['Validation loss',f(r.val)],['Khoảng cách',f(r.gap)]],`Bậc ${p.degree}, λ = ${f(p.lambda)}: train ${f(r.train)}, validation ${f(r.val)}. ${r.gap>.35?'Khoảng cách lớn: mô hình đang overfit; tăng λ hoặc giảm bậc.':p.degree>=7?'Bậc cao nhưng chưa tách rõ: thử tăng λ để kiểm tra.':'Đây là mô phỏng định tính, không phải kết quả đo trên dữ liệu thật.'} Tối thiểu train loss không đồng nghĩa cấu hình tốt nhất.`];
      case 'momentum':return [[['w sau 12 bước',f(r.final)],['Khoảng cách tới 2',f(r.gap)],['|w| lớn nhất',f(r.max)]],`Với β = ${f(p.momentum)} và η = ${f(p.lr)}, quỹ đạo dừng ở w = ${f(r.final)}. ${r.gap>.5?'Quán tính lớn làm vọt qua nghiệm; giảm β hoặc η.':'Quán tính giúp đi qua vùng phẳng nhưng vẫn có thể dao động nếu η quá lớn.'} Đây là hàm bậc hai một tham số.`];
      case 'leakage':return [[['Accuracy trung thực',f(100*r.honest)+'%'],['Accuracy lạc quan',f(100*r.optimistic)+'%'],['Khoảng cách',f(100*r.gap)+' điểm %']],`${f(p.duplicate)}% mẫu trùng và ${p.fitAll?'fit scaler trên toàn bộ dữ liệu':'fit scaler chỉ trên train'} tạo khoảng cách ${f(100*r.gap)} điểm %. Con số lạc quan không phải năng lực mô hình; hãy tách test trước khi fit bất kỳ bước nào.`];
      case 'neuron':return [[['z',f(r.z)],['Activation',f(r.a)],['Đạo hàm cục bộ',f(r.grad)],['Nhãn theo 0,5',String(r.label)]],`z = ${f(p.w1)} × ${f(p.x1)} + ${f(p.w2)} × ${f(p.x2)} + ${f(p.b)} = ${f(r.z)}; ${p.activation} cho ${f(r.a)}. Activation tạo phi tuyến nhưng một neuron vẫn chỉ tách bằng một đường thẳng.`];
      case 'batch':return [[['Bước mỗi epoch',f(r.steps)],['Tổng cập nhật',f(r.total)],['Mẫu đã thấy',f(r.seen)],['Batch cuối',f(r.last)]],`${p.dataset} mẫu, batch ${p.batch}: ${f(r.steps)} bước mỗi epoch, batch cuối có ${f(r.last)} mẫu. Batch lớn giảm số cập nhật nhưng không đổi số mẫu đã thấy; learning rate cần được chọn lại khi đổi batch.`];
      case 'normalize':return [[['Độ lệch chuẩn',f(r.std)],['Trạng thái',r.status]],`Sau ${p.depth} tầng, độ lệch chuẩn ước lượng là ${f(r.std)} (${r.status}). ${p.normalize?'Chuẩn hóa giữ phương sai quanh 1 nhưng thêm chi phí và thống kê cần tính đúng lúc train/test.':'Không chuẩn hóa: khởi tạo nhỏ làm tín hiệu co lại; khởi tạo lớn làm bùng nổ.'} Đây là mô hình nhân hệ số đơn giản, không phải mạng thật.`];
      case 'curves':return [[['Train cuối',f(r.train[r.train.length-1])],['Validation cuối',f(r.val[r.val.length-1])],['Khoảng cách cuối',f(r.finalGap)],['Chẩn đoán',r.diagnosis]],`Train cuối ${f(r.train[r.train.length-1])}, validation cuối ${f(r.val[r.val.length-1])}, khoảng cách ${f(r.finalGap)}. Chẩn đoán: ${r.diagnosis}. Overfit cần thêm dữ liệu/regularization; underfit cần mô hình mạnh hơn hoặc train lâu hơn.`];
      case 'conv':return [[['Cạnh feature map',f(r.out)],['Vị trí kernel',`(${r.ky}; ${r.kx})`],['Tổng patch',f(r.patchSum)],['Tham số',f(r.params)],['Phép nhân-cộng',f(r.ops)]],`Cạnh ra = (${p.size} + 2×${p.padding} − ${p.kernel})/${p.stride} + 1 = ${f(r.out)}. Cửa sổ ${p.kernel}×${p.kernel} đang lấy mẫu từ ô (${r.ky}; ${r.kx}), tổng có trọng số = ${f(r.patchSum)}. Volume 3D xếp ${p.channels} feature map; kênh 1 là bản đồ đang xem. Với ảnh vào một kênh, mỗi kênh ra cần ${p.kernel}×${p.kernel} trọng số cộng bias, nên tổng là ${f(r.params)}. Số tham số không phụ thuộc kích thước ảnh vì kernel dùng chung.`];
      case 'augment':return [[['Lượt ảnh mỗi epoch',f(r.effective)],['Tham số học',f(r.trainable)],['Chiến lược',r.strategy]],`${p.dataset} ảnh × ${p.factor} biến thể = ${f(r.effective)} lượt mỗi epoch; đóng băng ${f(p.frozen)}% nên chỉ còn ${f(r.trainable)} tham số học. Chiến lược: ${r.strategy}. Tăng cường dữ liệu không tạo thông tin mới; nó thay đổi phân bố nhìn thấy.`];
      case 'softmax':return [[['P(lớp 1)',f(100*r.probs[0])+'%'],['P(lớp 2)',f(100*r.probs[1])+'%'],['P(lớp 3)',f(100*r.probs[2])+'%'],['Lớp trội',String(r.top)],['Macro recall',f(r.macro)+'%']],`Ba xác suất cộng lại bằng 100%; lớp ${r.top} có xác suất lớn nhất. Với dữ liệu lệch ${f(p.majority)}% lớp đa số, accuracy luôn đoán lớp đa số là ${f(r.accuracy)}% nhưng macro recall chỉ ${f(r.macro)}%; hai thước đo kể hai câu chuyện.`];
      case 'iou':return [[['Diện tích giao',f(r.inter)],['Diện tích hợp',f(r.union)],['IoU',r.iou===null?f(null):f(r.iou)],['Đạt ngưỡng 0,5',r.pass?'Có':'Không']],`Giao = ${f(r.inter)}, hợp = ${f(r.union)}, IoU = ${r.iou===null?f(null):f(r.iou)}. ${r.pass?'Hộp đạt ngưỡng 0,5 trong ví dụ này.':'Hộp chưa đạt ngưỡng 0,5.'} IoU phụ thuộc cả vị trí lẫn kích thước; một hộp nhỏ đúng tâm vẫn có thể có IoU thấp.`];
      case 'probe':return [[['Tham số phải học',f(r.trainable)],['Chiến lược',r.strategy],['LR gợi ý',f(r.recommendLr)]],`Đóng băng ${f(p.frozen)}% để lại ${f(r.trainable)} tham số học. Với ${f(p.data)} mẫu mới, chiến lược gợi ý là ${r.strategy}; LR gợi ý ${f(r.recommendLr)}. Ít dữ liệu thường nên đóng băng nhiều hơn, nhưng không có ngưỡng tuyệt đối.`];
      case 'context':return [[['FLOPs attention',f(r.flops)+' GFLOPs'],['Bộ nhớ attention',f(r.memory)+' GB'],['Tỉ lệ token so với 512',f(r.ratio)+'×']],`Với ${p.tokens} token, ${p.dim} chiều và ${p.layers} tầng, ước lượng ${f(r.flops)} GFLOPs và ${f(r.memory)} GB chỉ cho ma trận attention. Tăng gấp đôi số token làm phần bình phương tăng gấp bốn; đây là lý do context dài đắt.`];
      case 'rounds':return [[['Thời gian tính toán',f(r.compute)+' phút'],['Thời gian chờ',f(r.wait)+' phút'],['Dung lượng truyền',f(r.comm)+' MB'],['Client-vòng',f(r.coverage)]],`${p.clients} client × ${p.rounds} vòng × ${p.local} local epoch cho ${f(r.compute)} phút tính toán ước lượng và ${f(r.comm)} MB truyền. Thêm client tăng cả tính toán lẫn truyền; tăng local epoch giảm số vòng nhưng tăng drift.`];
      case 'noniid':return [[['Độ trôi proxy',f(r.drift)],['Độ phủ client',f(r.coverage)+'%'],['Rủi ro',f(r.risk)]],`Không đồng nhất ${f(p.heterogeneity)}% và ${p.local} local epoch cho độ trôi proxy ${f(r.drift)}. Sampling ${f(p.sampling)}% phủ ${f(r.coverage)}% client; tăng sampling giảm bỏ sót nhưng tăng chi phí mỗi vòng.`];
      case 'dp':return [[['Độ lớn nhiễu σ',f(r.sigma)],['Điểm hữu ích',f(r.utility)],['Nhiễu mỗi client',f(r.noisePerClient)]],`ε = ${f(p.epsilon)} và clipping C = ${f(p.clip)} cho σ ≈ ${f(r.sigma)}. Giảm ε để riêng tư hơn làm nhiễu tăng và độ hữu ích giảm. Đây là ước lượng Gaussian mechanism, chưa phải kiểm toán privacy đầy đủ.`];
      case 'incremental':return [[['Giữ kiến thức cũ',f(r.retention)],['Học task mới',f(r.plasticity)],['Cân bằng',f(r.balance)]],`Rehearsal ${p.replay} mẫu/task, regularization ${f(p.reg)}, giống nhau ${f(p.similarity)}%: giữ được ${f(r.retention)} điểm và học mới ${f(r.plasticity)} điểm. Tăng replay/reg giữ kiến thức nhưng có thể giảm plasticity; đây là trade-off, không phải công thức tối ưu.`];
      case 'clmetrics':return [[['Forgetting',f(r.forgetting)+' điểm %'],['BWT',f(r.bwt)+' điểm %'],['ACC',f(r.acc)+'%']],`Forgetting = trước − sau = ${f(r.forgetting)}; BWT = sau − trước = ${f(r.bwt)}; ACC trung bình task cũ và mới = ${f(r.acc)}%. Ba số này không thay thế nhau; cần ghi rõ quy ước và lịch sử task.`];
      case 'memory':return [[['Bộ nhớ rehearsal',f(r.mb)+' MB'],['Số mẫu lưu',f(r.exposure)],['MB mỗi task',f(r.perTask)]],`${p.tasks} task × ${p.samples} mẫu × ${p.bytes} byte = ${f(r.mb)} MB. Lưu càng nhiều càng giúp rehearsal nhưng tăng chi phí và rủi ro riêng tư; nén hoặc tổng hợp mẫu là lựa chọn khác.`];
      case 'pipeline':return [[['Cập nhật địa phương',f(r.updates)],['Dung lượng truyền',f(r.comm)+' MB'],['Thời gian ước lượng',f(r.time)+' phút']],`${p.clients} client × ${p.rounds} vòng × ${p.tasks} task × ${p.local} local epoch = ${f(r.updates)} cập nhật địa phương. Truyền thông khoảng ${f(r.comm)} MB; tăng local epoch giảm vòng nhưng tăng drift và chi phí client.`];
      case 'drift':return [[['Độ trôi',f(r.drift)],['Forgetting',f(r.forgetting)],['Ổn định',f(r.stability)],['Học mới',f(r.plasticity)]],`Local epoch ${p.local}, lệch dữ liệu ${f(p.shift)}%, replay ${f(p.replay)}%: drift ${f(r.drift)}, forgetting ${f(r.forgetting)}, ổn định ${f(r.stability)}. Replay kéo forgetting xuống nhưng không xóa drift; cần đo trên từng client.`];
      case 'ablation':return [[['Baseline',f(p.baseline)],['Bỏ A',f(p.baseline-p.deltaA)],['Bỏ B',f(p.baseline-p.deltaB)],['Bỏ C',f(p.baseline-p.deltaC)],['Thành phần quan trọng nhất',r.best]],`Bỏ ${r.best} làm giảm nhiều nhất (${f(r.maxDrop)} điểm). Ablation chỉ có nghĩa khi mọi biến thể dùng cùng dữ liệu, cùng ngân sách tính toán và cùng quy trình đánh giá.`];
      case 'baseline':return [[['Điểm hiệu quả',f(r.score)],['Accuracy/tham số',f(r.perParam)],['Kích thước test',f(r.testN)]],`Điểm hiệu quả ước lượng ${f(r.score)} từ accuracy, tham số và latency. Accuracy ${f(p.accuracy)}% với ${f(p.params)} triệu tham số có thể tốt hơn nhưng đắt hơn nhiều lần; baseline phải so cùng chi phí.`];
      case 'audit':return [[['CI 95% xấp xỉ', '±'+f(r.ci)+' điểm'],['Nguy cơ chọn lọc',f(r.fdr)+'%'],['Độ tự tin',f(r.confidence)+'%']],`${p.runs} lần chạy và ${p.seeds} seed cho CI xấp xỉ ±${f(r.ci)} điểm. ${r.fdr>40?'Nguy cơ báo cáo chọn lọc còn cao: thêm kiểm tra và seed.':'Đã có một số kiểm tra, nhưng CI xấp xỉ không thay thế phân tích thống kê đầy đủ.'} Đây là proxy định tính, không phải p-value.`];
      case 'checklist':return [[['Số mục đã làm',`${r.done}/5`],['Điểm quy trình',f(r.score)],['Sẵn sàng báo cáo',r.ready?'Có':'Chưa'],['Còn thiếu',r.missing.length?r.missing.join(', '):'Không']],`Đã làm ${r.done}/5 mục, điểm ${f(r.score)}. ${r.ready?'Quy trình đủ mức tối thiểu, nhưng điểm cao không bảo đảm kết luận đúng.':'Còn thiếu: '+r.missing.join(', ')+'. Hãy hoàn tất trước khi báo cáo.'} Bảng kiểm chỉ kiểm tra sự hiện diện, không kiểm tra chất lượng từng bước.`];
      default:return null;
    }
  }
  function heatColor(value,min,max){
    if(!Number.isFinite(value))return '#f6f1e8';
    if(max===min)return '#d8c7a8';
    const t=(value-min)/(max-min||1);
    return value<0?`rgba(173,84,47,${(.12+.55*(1-t)).toFixed(2)})`:`rgba(31,111,95,${(.1+.65*t).toFixed(2)})`;
  }
  function matrixPlot(p,r){
    const ox=210,oy=168,scale=34,W=420,H=320,clip='matrix-clip-'+(++chartSerial);
    const pt=(x,y)=>[ox+x*scale,oy-y*scale];
    let grid='';for(let i=-5;i<=5;i++){grid+=`<path d="M${ox+i*scale} 8 V${H-8} M8 ${oy+i*scale} H${W-8}" stroke="#eee7db"/>`;}
    const square=[[0,0],[1,0],[1,1],[0,1]].map(([x,y])=>pt(x,y).join(',')).join(' ');
    const par=[[0,0],[p.a,p.c],[p.a+p.b,p.c+p.d],[p.b,p.d]].map(([x,y])=>pt(x,y).join(',')).join(' ');
    const eigen=r.eigen.map(e=>{
      const t=7;
      return `<line x1="${pt(-e.ex*t,-e.ey*t)[0]}" y1="${pt(-e.ex*t,-e.ey*t)[1]}" x2="${pt(e.ex*t,e.ey*t)[0]}" y2="${pt(e.ex*t,e.ey*t)[1]}" stroke="#9e7a31" stroke-width="1.5" stroke-dasharray="6 5"/><text x="${pt(e.ex*3.3,e.ey*3.3)[0]+4}" y="${pt(e.ex*3.3,e.ey*3.3)[1]}" font-size="11" fill="#9e7a31">λ=${format(e.lambda)}</text>`;
    }).join('');
    const v=pt(r.vx,r.vy),av=pt(r.x,r.y);
    return svgBox(`<defs><clipPath id="${clip}"><rect x="8" y="8" width="${W-16}" height="${H-16}"/></clipPath></defs><g clip-path="url(#${clip})">${grid}<path d="M8 ${oy} H${W-8} M${ox} 8 V${H-8}" stroke="#a89c8b"/>${eigen}<polygon points="${square}" fill="none" stroke="#8d8274" stroke-dasharray="3 3"/><polygon points="${par}" fill="rgba(173,84,47,.16)" stroke="#ad542f" stroke-width="2"/><line x1="${ox}" y1="${oy}" x2="${v[0]}" y2="${v[1]}" stroke="#1f6f5f" stroke-width="4"/><line x1="${ox}" y1="${oy}" x2="${av[0]}" y2="${av[1]}" stroke="#ad542f" stroke-width="3" stroke-dasharray="7 4"/></g><circle data-handle="vector" cx="${v[0]}" cy="${v[1]}" r="11" fill="#1f6f5f" stroke="#fff" stroke-width="3" style="cursor:grab"/><circle cx="${av[0]}" cy="${av[1]}" r="6" fill="#ad542f" stroke="#fff" stroke-width="2"/><text x="12" y="20" font-size="12" fill="#1f6f5f">v = (${format(r.vx)}; ${format(r.vy)}) — kéo điểm xanh</text><text x="12" y="${H-8}" font-size="12" fill="#ad542f">Av = (${format(r.x)}; ${format(r.y)}) · |det A| = ${format(r.area)} · ${r.eigen.length?r.eigen.length+' phương thực':'không có phương thực'}</text>`,`Mặt phẳng với vector v, ảnh Av và hình bình hành diện tích ${format(r.area)}`,W,H);
  }
  function gradientPlot(p,r){
    const W=420,H=300,x0=-3,x1=9,y0=0,y1=44,clip='gradient-clip-'+(++chartSerial);
    const px=x=>34+(x-x0)/(x1-x0)*(W-58),py=y=>H-42-(y-y0)/(y1-y0)*(H-76);
    const curve=Array.from({length:121},(_,i)=>{const x=x0+(x1-x0)*i/120;return (i?'L':'M')+px(x).toFixed(1)+' '+py((x-3)**2).toFixed(1);}).join(' ');
    const trail=(p.trail||[r.x]).map((x,i)=>`<circle cx="${px(x)}" cy="${py((x-3)**2)}" r="${i===0?4:3}" fill="#9e7a31" opacity="${(.35+.65*(i+1)/((p.trail||[]).length||1)).toFixed(2)}"/>`).join('');
    const slope=2*(r.x-3),tx0=Math.max(x0,r.x-1.4),tx1=Math.min(x1,r.x+1.4);
    const tangent=`<line x1="${px(tx0)}" y1="${py(r.loss+slope*(tx0-r.x))}" x2="${px(tx1)}" y2="${py(r.loss+slope*(tx1-r.x))}" stroke="#ad542f" stroke-width="2" stroke-dasharray="5 4"/>`;
    return svgBox(`<defs><clipPath id="${clip}"><rect x="34" y="20" width="${W-58}" height="${H-42}"/></clipPath></defs><g clip-path="url(#${clip})"><path d="M${px(0)} 20 V${H-42} M34 ${py(0)} H${W-24}" stroke="#d8d0c2"/>${tangent}<path d="${curve}" fill="none" stroke="#1f6f5f" stroke-width="3"/>${trail}<circle data-handle="gradient" cx="${px(r.x)}" cy="${py(r.loss)}" r="11" fill="#ad542f" stroke="#fff" stroke-width="3" style="cursor:grab"/></g><text x="12" y="16" font-size="12" fill="#6f675d">f(x) = (x − 3)² · kéo điểm đỏ hoặc dùng nút</text><text x="12" y="${H-10}" font-size="11" fill="#6f675d">x = ${format(r.x)} · loss = ${format(r.loss)} · gradient = ${format(r.gradient)} · ${stepsLabel(p)}</text>`,`Đường cong loss với điểm hiện tại và ${(p.trail||[]).length} vết bước`,W,H);
  }
  function stepsLabel(p){return p.trail?`vệt ${p.trail.length} điểm`:'chưa chạy';}
  function convVisual(p,r){
    const n=r.input.length,K=r.kernel.length,out=r.map.length,filters={vertical:'cạnh dọc',edge:'viền',blur:'làm mờ',identity:'giữ nguyên'};
    const icell=Math.max(10,Math.min(24,220/n)),mcell=Math.max(9,Math.min(24,190/Math.max(out,1))),ix=22,iy=52,mx=22,my=52;
    let inputGrid=`<rect x="${ix}" y="${iy}" width="${n*icell}" height="${n*icell}" fill="#faf8f3" stroke="#b5ac9e"/>`;
    r.input.forEach((row,y)=>row.forEach((value,x)=>{inputGrid+=`<rect x="${ix+x*icell}" y="${iy+y*icell}" width="${icell-.6}" height="${icell-.6}" fill="${heatColor(value,1,13)}"/><text x="${ix+x*icell+icell/2}" y="${iy+y*icell+icell/2+3.5}" text-anchor="middle" font-size="${Math.min(10,icell*.48)}" fill="#3f382f">${value}</text>`;}));
    inputGrid+=`<rect x="${ix+r.kx*icell}" y="${iy+r.ky*icell}" width="${K*icell}" height="${K*icell}" fill="rgba(158,122,49,.13)" stroke="#9e7a31" stroke-width="2.5" style="cursor:grab" data-handle="kernel"/><rect x="${ix}" y="${iy}" width="${n*icell}" height="${n*icell}" fill="transparent" style="cursor:grab" data-handle="kernel"/>`;
    const inputSVG=`<svg data-input-grid="1" viewBox="0 0 ${ix*2+n*icell} ${iy+n*icell+34}" role="img" aria-label="Ảnh đầu vào, cửa sổ kernel có thể kéo"><text x="${ix}" y="24" font-size="12" fill="#544b40">Ảnh vào ${n}×${n} · kéo ô vàng</text><text x="${ix}" y="${iy+n*icell+24}" font-size="11" fill="#6f675d">patch tổng có trọng số = ${format(r.patchSum)}</text>${inputGrid}</svg>`;
    let mapGrid=`<rect x="${mx}" y="${my}" width="${out*mcell}" height="${out*mcell}" fill="#faf8f3" stroke="#b5ac9e"/>`;
    r.map.forEach((row,y)=>row.forEach((value,x)=>{mapGrid+=`<rect x="${mx+x*mcell}" y="${my+y*mcell}" width="${mcell-.6}" height="${mcell-.6}" fill="${heatColor(value,r.min,r.max)}"/>${mcell>=16?`<text x="${mx+x*mcell+mcell/2}" y="${my+y*mcell+mcell/2+3}" text-anchor="middle" font-size="${Math.min(9,mcell*.45)}" fill="#3f382f">${format(value)}</text>`:''}`;}));
    const mapSVG=`<svg viewBox="0 0 ${mx*2+out*mcell} ${my+out*mcell+34}" role="img" aria-label="Feature map ${out} nhân ${out}"><text x="${mx}" y="24" font-size="12" fill="#544b40">Feature map ${out}×${out} · ${filters[r.maps[0].kind]||r.maps[0].kind}</text><text x="${mx}" y="${my+out*mcell+24}" font-size="11" fill="#6f675d">${r.ops} phép nhân-cộng ước lượng</text>${mapGrid}</svg>`;
    const outSize=out,cell=Math.max(5,Math.min(10,120/Math.max(outSize,1))),baseX=160,baseY=206,layers=r.maps.length;
    let volume='';
    for(let li=layers-1;li>=0;li--){
      const shiftX=li*24,shiftY=-li*28,active=li===0;
      for(let y=0;y<outSize;y++)for(let x=0;x<outSize;x++){
        const value=r.maps[li].map[y][x],u=baseX+(x-y)*cell*.9+shiftX,v=baseY+(x+y)*cell*.45+shiftY;
        volume+=`<polygon points="${u},${v-cell*.45} ${u+cell*.9},${v} ${u},${v+cell*.45} ${u-cell*.9},${v}" fill="${heatColor(value,r.maps[li].min,r.maps[li].max)}" stroke="${active?'#544b40':'rgba(84,75,64,.25)'}" stroke-width="${active?.55:.25}"/>`;
      }
      volume+=`<text x="${baseX+shiftX+outSize*cell*.9+5}" y="${baseY+shiftY+6}" font-size="10" fill="${active?'#1f6f5f':'#8d8274'}">kênh ${li+1}</text>`;
    }
    const volumeSVG=`<svg viewBox="0 0 340 260" role="img" aria-label="Volume đặc trưng 3D xếp các kênh"><text x="14" y="20" font-size="12" fill="#544b40">Volume 3D: C=${layers}, H=W=${outSize} · kênh 1 ở trước</text>${volume}</svg>`;
    const channelButtons=r.maps.map((map,index)=>`<button type="button" class="conv-channel${index===0?' is-active':''}" data-channel="${index}" data-filter="${map.kind}"><span>Kênh ${index+1}</span><small>${filters[map.kind]||map.kind}</small></button>`).join('');
    return `<div class="conv-visual" data-volume="3d"><div class="conv-panels"><div class="conv-panel">${inputSVG}</div><div class="conv-panel">${mapSVG}</div></div><div class="conv-volume">${volumeSVG}<div class="conv-channels">${channelButtons}</div></div></div>`;
  }
  function plot(type,p,r,ghost){
    const custom=definitions[type];
    if(custom&&typeof custom.plot==='function')return custom.plot(p,r,ghost);
    if(type==='matrix')return matrixPlot(p,r);
    if(type==='gradient')return gradientPlot(p,r);
    if(type==='conv')return convVisual(p,r);
    const extra=extraPlot(type,p,r);
    if(extra)return extra;
    if(type==='linear'){
      const x0=-5,x1=5,y0=-10,y1=10;
      const point=(x,y)=>[25+(x-x0)/(x1-x0)*310,245-(y-y0)/(y1-y0)*220];
      const path=Array.from({length:101},(_,i)=>{const x=x0+(x1-x0)*i/100,y=p.w*x+p.b;return (i?'L':'M')+point(x,y).map(v=>v.toFixed(2)).join(' ');}).join(' ');
      const [cx,cy]=point(2,r.y);
      return svg(`<defs><clipPath id="clip-${type}"><rect x="25" y="25" width="310" height="220"/></clipPath></defs><path d="M25 245 H335 M${point(0,0)[0]} 25 V245" stroke="#b5ac9e" fill="none"/><g clip-path="url(#clip-${type})"><path d="${path}" stroke="#1f6f5f" stroke-width="3" fill="none"/><circle cx="${cx}" cy="${cy}" r="6" fill="#ad542f"/></g><text x="25" y="18" font-size="13" fill="#6f675d">y = wx + b</text><text x="28" y="264" font-size="12" fill="#6f675d">x từ ${x0} đến ${x1}; trục đứng từ ${y0} đến ${y1}</text>`,`Dự đoán tại x=2: ${format(r.y)}`);
    }
    if(type==='bayes')return bars([['Spam có dấu hiệu',r.tp,'#1f6f5f'],['Không spam có dấu hiệu',r.fp,'#ad542f']],Math.max(r.tp,r.fp,1));
    if(type==='metrics')return bars([['TP',p.tp,'#1f6f5f'],['FP',p.fp,'#ad542f'],['FN',p.fn,'#9e7a31'],['TN',p.tn,'#7a8b63']],Math.max(p.tp,p.fp,p.fn,p.tn,1));
    if(type==='fedavg')return bars([['Mẫu client A',p.na,'#1f6f5f'],['Mẫu client B',p.nb,'#ad542f']],Math.max(p.na,p.nb,1));
    if(type==='forgetting')return bars([['Cũ · trước',p.before,'#7a8b63'],['Cũ · sau',p.old,'#1f6f5f'],['Mới · sau',p.fresh,'#ad542f']]);
    if(type==='attention')return bars([['Trọng số key 1 (%)',100*r.a,'#1f6f5f'],['Trọng số key 2 (%)',100*r.b,'#ad542f']]);
    if(type==='split')return bars([['Train',r.train,'#1f6f5f'],['Validation',r.validation,'#9e7a31'],['Test',Math.max(0,r.test),'#ad542f']],1000);
    if(type==='cost')return bars([['Một vòng (MB)',r.roundMB,'#1f6f5f'],['Tất cả vòng (MB)',r.totalGB*1000,'#ad542f']],r.totalGB*1000);
    return '';
  }
  function describe(type,p,r,steps){
    const custom=definitions[type];
    if(custom&&typeof custom.describe==='function')return custom.describe(p,r,steps);
    const f=format;
    switch(type){
      case 'linear':return [[['Dự đoán tại x=2',f(r.y)],['Sai số có dấu',f(r.error)],['Sai số bình phương',f(r.loss)]],`ŷ = ${f(p.w)} × 2 + ${f(p.b)} = ${f(r.y)}. Đây là sai số trên một mẫu; loss trung bình cần cộng qua các mẫu rồi chia số mẫu.`];
      case 'gradient':return [[['Số bước',String(steps)],['x hiện tại',f(r.x)],['Loss',f(r.loss)],['Gradient',f(r.gradient)],['x kế tiếp',f(r.next)]],`Gradient = ${f(r.gradient)}; x kế = x − η × gradient = ${f(r.next)}. ${p.rate===0?'η = 0: không cập nhật.':p.rate<1?'Với hàm bậc hai này, 0 < η < 1 cho hội tụ.':p.rate===1?'η = 1: thường dao động đối xứng quanh 3; chỉ đứng yên khi đã ở 3.':'η > 1: thường đi xa nghiệm hơn, không bảo đảm giảm loss.'}${r.loss>40?' Điểm hiện ngoài khung vẽ; số liệu vẫn được tính.':''} Vệt vàng trên hình lưu các điểm đã đi, không phải quỹ đạo liên tục.`];
      case 'bayes':return [[['Spam có dấu hiệu (kỳ vọng)',f(r.tp)],['Không spam có dấu hiệu',f(r.fp)],['P(spam | dấu hiệu)',r.posterior===null?f(null):f(100*r.posterior)+'%']],`Trong 10.000 email giả định: posterior = ${f(r.tp)} / (${f(r.tp)} + ${f(r.fp)}). ${r.posterior===null?'Không có email mang dấu hiệu theo mô hình này nên điều kiện có xác suất 0.':'Chất lượng dấu hiệu và tỉ lệ ban đầu đều ảnh hưởng kết luận; số đếm là kỳ vọng, không phải dữ liệu đo.'}`];
      case 'matrix':{const eig=r.eigen.length?r.eigen.map(e=>`λ=${f(e.lambda)} theo (${f(e.ex)}; ${f(e.ey)})`).join('; '):'không có eigenvalue thực';return [[['Av',`(${f(r.x)}; ${f(r.y)})`],['Định thức',f(r.det)],['Diện tích ô đơn vị',f(r.area)],['Eigenvalue thực',eig]],`[${f(p.a)} ${f(p.b)}; ${f(p.c)} ${f(p.d)}] × (${f(r.vx)}; ${f(r.vy)}) = (${f(r.x)}; ${f(r.y)}). ${Math.abs(r.det)<1e-9?'Định thức 0: phép biến đổi ép mặt phẳng thành một đường, không khả nghịch.':'Định thức khác 0: diện tích đổi theo hệ số |det A|; dấu âm nghĩa là hướng bị lật.'} ${r.eigen.length?'Các đường vàng là phương thực (eigenvector) — hướng không bị xoay, chỉ co giãn.':'Hai eigenvalue phức nên không có hướng thực giữ nguyên; phép biến đổi có thành phần xoay.'}`];}
      case 'metrics':{const percent=x=>x===null?f(null):f(100*x)+'%';return [[['Precision',percent(r.precision)],['Recall',percent(r.recall)],['F1',percent(r.f1)],['Accuracy',percent(r.accuracy)]],`Precision = TP/(TP+FP); recall = TP/(TP+FN). Accuracy phụ thuộc cả TN. Mẫu số 0 được hiển thị không xác định thay vì gán một quy ước ngầm.`];}
      case 'fedavg':return [[['Tổng mẫu tham gia',f(r.total)],['Trọng số A',r.alpha===null?f(null):f(r.alpha)],['Tham số gộp',f(r.average)]],r.total?`w = (${p.na} × ${f(p.wa)} + ${p.nb} × ${f(p.wb)}) / ${r.total}. Gộp tham số không bảo đảm cùng kết quả với train tập trung; ví dụ một tham số chỉ minh họa phép gộp.`:'Tổng số mẫu bằng 0: không thực hiện phép gộp. Client không có mẫu không đóng góp trọng số.' ];
      case 'forgetting':return [[['Mức giảm nhiệm vụ cũ',f(r.drop)+' điểm %'],['Trung bình hai nhiệm vụ',f(r.average)+'%']],`Mức giảm = ${p.before} − ${p.old}. ${r.drop<0?'Giá trị âm là cải thiện trên nhiệm vụ cũ.':'Điểm trung bình có thể che mất mức suy giảm trên nhiệm vụ cũ.'} Đây là hai mốc của một nhiệm vụ; forgetting tổng quát cần lịch sử và quy ước tổng hợp được ghi rõ.`];
      case 'attention':return [[['Logit sau scaling',`(${f(r.l1)}; ${f(r.l2)})`],['Softmax',`(${f(r.a)}; ${f(r.b)})`],['Tổng có trọng số V',`(${f(r.a)}; ${f(r.b)})`]],`Softmax phân bổ tổng trọng số bằng 1. Raw dot thứ hai = ${f(p.s2)} vẫn có thể nhận trọng số ${f(r.b)}. V cố định là hai vector cơ sở; trong mô hình thật Q,K,V là các phép chiếu học được.`];
      case 'split':return [[['Train',f(r.train)],['Validation',f(r.validation)],['Test còn lại',r.valid?f(r.test):'Chia chưa hợp lệ']],r.valid?'Ba tập có vai trò riêng; đúng tỉ lệ chưa bảo đảm không rò rỉ. Cần tách theo người, nhóm hoặc thời gian khi cấu trúc dữ liệu yêu cầu.':'Tổng tỉ lệ train và validation phải nhỏ hơn 100% để còn tập test. Điều chỉnh lại hai thanh trượt.'];
      case 'cost':return [[['Mỗi vòng',f(r.roundMB)+' MB'],['Toàn bộ lượt truyền',f(r.totalGB)+' GB']],`2 × ${p.size} MB × ${p.clients} client × ${p.rounds} vòng = ${f(r.totalGB)} GB (1 GB = 1.000 MB). Chưa tính header, retry, tải không đối xứng, server broadcast tối ưu hoặc nén. Gửi dense Δ cùng dtype không tự giảm byte.`];
    }
    return extraDescribe(type,p,r,steps);
  }
  function mount(root){
    root.querySelectorAll('[data-experiment]').forEach(box=>{
      const type=box.dataset.experiment,def=definitions[type],params=defaults(type),stage=box.querySelector('[data-stage]');
      let steps=0,initialX=params.x,timer=null,drag=null,snapshot=null,interacted=false,statusTimer=null;
      params.trail=[params.x];
      const noteInteraction=()=>{
        if(interacted)return;
        interacted=true;
        if(typeof window.recordLabInteraction==='function')window.recordLabInteraction(type);
      };
      const setStatus=text=>{
        const el=box.querySelector('[data-tool-status]');
        if(!el)return;
        el.textContent=text;
        if(statusTimer)clearTimeout(statusTimer);
        statusTimer=setTimeout(()=>{el.textContent='';},3500);
      };
      const stateForShare=()=>{
        const allowed=new Set([...def.controls.map(control=>controlInfo(control).key),...Object.keys(def.extras||{})]);
        const state={};
        Object.keys(params).forEach(key=>{if(allowed.has(key))state[key]=params[key];});
        return state;
      };
      const copyText=text=>{
        if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(text);
        const area=document.createElement('textarea');
        area.value=text;area.style.position='fixed';area.style.opacity='0';
        document.body.appendChild(area);area.select();
        const ok=document.execCommand&&document.execCommand('copy');
        document.body.removeChild(area);
        return ok?Promise.resolve():Promise.reject(new Error('copy unavailable'));
      };
      const controls=[...box.querySelectorAll('[data-param]')];
      const controlFor=key=>controlInfo(def.controls.find(control=>(Array.isArray(control)?control[0]:control.key)===key));
      function sync(control){
        const info=controlFor(control.dataset.param);
        if(info.type==='toggle')control.checked=Boolean(params[info.key]);
        else control.value=params[info.key];
        if(info.type==='range'){const output=control.parentElement.querySelector('output');if(output)output.textContent=format(params[info.key]);}
      }
      function stop(){
        if(timer){clearInterval(timer);timer=null;}
        const run=box.querySelector('[data-run]'),stopBtn=box.querySelector('[data-stop]');
        if(run)run.disabled=false;if(stopBtn)stopBtn.disabled=true;
      }
      function resetTrail(x){params.trail=[x];}
      function update(){
        if(type==='gradient')params.trail=params.trail&&params.trail.length?params.trail:[params.x];
        const r=calculate(type,params),[values,observation]=describe(type,params,r,steps);
        let ghost=null;
        if(snapshot){try{ghost=calculate(type,snapshot.params);}catch(_){ghost=null;}}
        controls.forEach(sync);
        box.querySelector('[data-visual]').innerHTML=plot(type,params,r,ghost);
        box.querySelector('[data-results]').innerHTML=values.map(([name,value])=>`<div><span>${safe(name)}</span><strong>${safe(value)}</strong></div>`).join('');
        box.querySelector('[data-observation]').textContent=observation;
        const view=box.querySelector('[data-snapshot-view]');
        if(view){
          view.hidden=!snapshot;
          if(snapshot)view.innerHTML=`<div class="snapshot-head"><b>Mốc A</b><button type="button" class="snapshot-clear" data-clear-snapshot>Xóa mốc</button></div><div class="snapshot-grid"><div><span class="snapshot-label">Đã lưu</span>${snapshot.values.map(([name,value])=>`<p>${safe(name)}: <b>${safe(value)}</b></p>`).join('')}</div><div><span class="snapshot-label">Hiện tại</span>${values.map(([name,value])=>`<p>${safe(name)}: <b>${safe(value)}</b></p>`).join('')}</div></div>`;
        }
        const step=box.querySelector('[data-step]');if(step)step.disabled=!Number.isFinite(r.next)||Math.abs(r.next)>1e6;
        box.querySelectorAll('[data-rate]').forEach(btn=>btn.classList.toggle('is-active',Math.abs(Number(btn.dataset.rate)-params.rate)<1e-9));
        if(typeof def.afterUpdate==='function')def.afterUpdate({box,params,result:r,update});
      }
      function reset(){
        stop();Object.assign(params,defaults(type));steps=0;initialX=params.x;params.trail=[params.x];update();
      }
      function oneStep(){
        const r=calculate(type,params);
        if(!Number.isFinite(r.next)||Math.abs(r.next)>1e6){stop();return false;}
        params.x=Math.round(r.next*1000)/1000;steps++;
        params.trail=params.trail||[];params.trail.push(params.x);
        if(params.trail.length>48)params.trail.shift();
        update();return true;
      }
      const gate=box.querySelector('[data-prediction]');
      if(gate){
        gate.querySelectorAll('[data-answer]').forEach(button=>button.addEventListener('click',()=>{
          noteInteraction();
          const result=predictionResult(type,button.dataset.answer),correct=def.prediction.correct;
          gate.querySelectorAll('[data-answer]').forEach(option=>{
            option.disabled=true;
            option.classList.toggle('is-correct',option.dataset.answer===correct);
            option.classList.toggle('is-wrong',option===button&&button.dataset.answer!==correct);
          });
          const feedback=gate.querySelector('[data-prediction-feedback]');
          feedback.textContent=`${result.correct?'Dự đoán đúng.':'Chưa đúng — đáp án đúng là '+result.answer+'.'} ${result.explain}`;
          feedback.className='prediction-feedback '+(result.correct?'is-correct':'is-wrong');
          stage.hidden=false;box.classList.add('prediction-passed');update();
        }));
      }
      box.querySelector('[data-snapshot]').addEventListener('click',()=>{
        noteInteraction();
        const r=calculate(type,params),[values,observation]=describe(type,params,r,steps);
        snapshot={params:stateForShare(),values,observation};
        update();setStatus('Đã lưu mốc A để so sánh.');
      });
      box.addEventListener('click',event=>{
        const clear=event.target.closest&&event.target.closest('[data-clear-snapshot]');
        if(!clear)return;
        snapshot=null;update();setStatus('Đã xóa mốc A.');
      });
      box.querySelector('[data-share]').addEventListener('click',()=>{
        noteInteraction();
        const url=typeof window.labShareUrl==='function'?window.labShareUrl(type,stateForShare()):location.href;
        copyText(url).then(()=>setStatus('Đã sao chép liên kết có trạng thái lab.')).catch(()=>setStatus('Không sao chép tự động được: '+url));
      });
      box.querySelector('[data-export]').addEventListener('click',()=>{
        noteInteraction();
        const r=calculate(type,params),[values,observation]=describe(type,params,r,steps);
        const controlLines=def.controls.map(control=>{const info=controlInfo(control);const raw=params[info.key];const value=info.type==='select'?(info.options.find(([key])=>key===raw)||[])[1]||raw:raw;return `- ${info.label}: **${value}**`;}).join('\n');
        const lines=[`# Phiếu lab — ${def.title}`,`Chương: ${document.title.replace(/ · Toán.*$/,'')}`,``,`## Dự đoán`,def.prediction?def.prediction.question:'Không có cổng dự đoán.',``,`## Trạng thái hiện tại`,controlLines,``,`## Số liệu`,...values.map(([name,value])=>`- ${name}: **${value}**`),``,`## Quan sát`,observation];
        if(def.challenge)lines.push('',`## Thử thách`,def.challenge.goal);
        if(snapshot)lines.push('',`## Mốc A`,...snapshot.values.map(([name,value])=>`- ${name}: **${value}**`));
        const blob=new Blob([lines.join('\n')],{type:'text/markdown;charset=utf-8'}),link=document.createElement('a');
        link.href=URL.createObjectURL(blob);link.download='phieu-lab-'+type+'.md';document.body.appendChild(link);link.click();document.body.removeChild(link);
        setTimeout(()=>URL.revokeObjectURL(link.href),1000);
        setStatus('Đã xuất phiếu lab Markdown.');
      });
      const challenge=box.querySelector('[data-check-challenge]');
      if(challenge&&def.challenge&&typeof def.challenge.check==='function')challenge.addEventListener('click',()=>{
        noteInteraction();
        const r=calculate(type,params);
        const passed=Boolean(def.challenge.check(params,r));
        const feedback=box.querySelector('[data-challenge-feedback]');
        if(feedback){feedback.dataset.state=passed?'correct':'wrong';feedback.textContent=passed?'Đạt mục tiêu. Hãy thử một cấu hình khác để kiểm tra hiểu biết.':'Chưa đạt mục tiêu. Đọc lại số liệu và thử thay đổi một tham số.';}
        if(passed&&typeof window.recordLabChallenge==='function')window.recordLabChallenge(type);
      });
      box.querySelectorAll('[data-error]').forEach(button=>button.addEventListener('click',()=>{
        noteInteraction();
        const error=(def.errors||[])[Number(button.dataset.error)];
        if(!error)return;
        Object.assign(params,defaults(type),error.params||{});steps=0;
        if(type==='gradient'){initialX=params.x;resetTrail(params.x);}
        update();
        const note=box.querySelector('[data-error-note]');
        if(note)note.textContent=error.explain||'';
        box.classList.add('is-error-state');
      }));
      controls.forEach(input=>{
        input.addEventListener(input.type==='range'?'input':'change',()=>{
          noteInteraction();
          const key=input.dataset.param;
          params[key]=input.type==='checkbox'?input.checked:input.type==='range'?Number(input.value):input.value;
          if(type==='gradient'&&(key==='x'||key==='rate')){if(key==='x')initialX=params.x;steps=0;resetTrail(params.x);}
          update();
        });
      });
      box.querySelector('[data-reset]').addEventListener('click',reset);
      const step=box.querySelector('[data-step]');if(step)step.addEventListener('click',()=>{oneStep();});
      const run=box.querySelector('[data-run]');
      if(run)run.addEventListener('click',()=>{
        if(timer)return;let count=0;
        run.disabled=true;const stopBtn=box.querySelector('[data-stop]');if(stopBtn)stopBtn.disabled=false;
        const tick=()=>{if(!box.isConnected){stop();return;}if(!oneStep()||++count>=10)stop();};
        tick();timer=setInterval(tick,460);
      });
      const stopBtn=box.querySelector('[data-stop]');if(stopBtn)stopBtn.addEventListener('click',stop);
      box.querySelectorAll('[data-rate]').forEach(btn=>btn.addEventListener('click',()=>{
        params.rate=Number(btn.dataset.rate);steps=0;resetTrail(params.x);update();
      }));
      box.querySelectorAll('[data-identity]').forEach(btn=>btn.addEventListener('click',()=>{params.a=1;params.b=0;params.c=0;params.d=1;steps=0;update();}));
      box.querySelectorAll('[data-rotate]').forEach(btn=>btn.addEventListener('click',()=>{
        const r=Math.PI/6;params.a=Math.cos(r);params.b=-Math.sin(r);params.c=Math.sin(r);params.d=Math.cos(r);steps=0;update();
      }));
      const visual=box.querySelector('[data-visual]');
      function svgForHandle(kind){return kind==='kernel'?visual.querySelector('svg[data-input-grid]'):visual.querySelector('svg');}
      function localPoint(svg,event){
        const matrix=svg&&svg.getScreenCTM&&svg.getScreenCTM();if(!matrix)return null;
        const point=svg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;return point.matrixTransform(matrix.inverse());
      }
      visual.addEventListener('click',event=>{
        const channel=event.target.closest&&event.target.closest('[data-channel]');
        if(channel){noteInteraction();params.filter=channel.dataset.filter;steps=0;update();}
      });
      visual.addEventListener('pointerdown',event=>{
        const handle=event.target.closest&&event.target.closest('[data-handle]');if(!handle)return;
        noteInteraction();drag={kind:handle.dataset.handle};event.preventDefault();
        if(visual.focus)visual.focus({preventScroll:true});
      });
      window.addEventListener('pointermove',event=>{
        if(!drag)return;
        const svg=svgForHandle(drag.kind),point=localPoint(svg,event);if(!point)return;
        if(drag.kind==='vector'){
          params.vx=Math.round(clamp((point.x-210)/34,-4,4)*10)/10;
          params.vy=Math.round(clamp((168-point.y)/34,-4,4)*10)/10;
          steps=0;update();
        }else if(drag.kind==='gradient'){
          params.x=Math.round(clamp(-3+(point.x-34)/362*12,-3,9)*10)/10;
          initialX=params.x;steps=0;resetTrail(params.x);update();
        }else if(drag.kind==='kernel'){
          const n=params.size,K=params.kernel,cell=Math.max(10,Math.min(24,220/n));
          params.kx=clamp(Math.floor((point.x-22)/cell),0,Math.max(0,n-K));
          params.ky=clamp(Math.floor((point.y-52)/cell),0,Math.max(0,n-K));
          steps=0;update();
        }
      });
      const endDrag=()=>{drag=null;};
      window.addEventListener('pointerup',endDrag);window.addEventListener('pointercancel',endDrag);
      visual.addEventListener('keydown',event=>{
        const keys={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]};
        if(!keys[event.key])return;
        noteInteraction();
        const [dx,dy]=keys[event.key],coarse=event.shiftKey?2:1;event.preventDefault();
        if(type==='matrix'){params.vx=clamp(Math.round((params.vx+dx*.2*coarse)*10)/10,-4,4);params.vy=clamp(Math.round((params.vy+dy*.2*coarse)*10)/10,-4,4);steps=0;update();}
        if(type==='gradient'){params.x=clamp(Math.round((params.x+dx*.5*coarse)*10)/10,-3,9);initialX=params.x;steps=0;resetTrail(params.x);update();}
        if(type==='conv'){params.kx=clamp(params.kx+dx*coarse,0,Math.max(0,params.size-params.kernel));params.ky=clamp(params.ky+dy*coarse,0,Math.max(0,params.size-params.kernel));steps=0;update();}
      });
      if(typeof def.bind==='function')def.bind({box,type,params,update,reset,visual:box.querySelector('[data-visual]'),controls,noteInteraction,getSteps:()=>steps,setSteps:value=>{steps=value;},resetTrail});
      reset();
    });
  }
  return {html,mount,calculate,definitions,controlInfo,defaults,plot,describe,predictionResult};
})();
