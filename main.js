// 현재 로그인이 되어있는지 체크
var isLogined = false;

// 로그인 화면에서 키보드 입력을 컨트롤 한다.
$('.kakao-login').keyup(function(event){
    if(event.keyCode === 13){
        // Enter 입력 시 실행
        $('#login-btn').click();
    }else{
        // Enter 이 외 입력 시 실행
        hideErrorLog(); // 로그인 실패 문구 제거
        if(getPassword().length > 5){
            enableLogin(); // 비밀번호가 6글자 이상일 경우 색상 로그인 가능하도록 변경
        }else{
            disableLogin(); // 비밀번호가 6글자 미만일 경우 색상 로그인 불가능하도록 변경
        }
    }
});


// 채팅창에서 키보드 입력을 컨트롤 한다.
$("#input-chat").keyup(function(event){
    if(event.keyCode == 8){
        // Backspace 입력 시 글자수가 없으면 전송이 불가능하도록 변경
        if(getInputChat().length <= 1){
            disableTextSend();
        }
    }else{
        // Backspace 입력 시 글자수가 있으면 전송이 가능하도록 변경
        if(getInputChat().length > 0){
            enableTextSend();
        }
    }
})

// 채팅창에서 키보드 입력을 컨트롤 한다.
$("#input-chat").keypress(function(event){

    if (event.keyCode == 13) {   
        // Enter 입력 시 실행
        // shift + enter가 함께 입력되었는지 확인한다. 
        // shift + enter가 줄바꿈이 일어나도록 처리하기 위함
        if(!event.shiftKey){
            // shift가 함께 입력되지 않았으면 채팅 전송이 이루어진다.
            event.preventDefault();
            sendText();
        }
    }else{
        if(getInputChat().length > 0){
            // 채팅 입력 시 글자수가 있으면 전송이 가능하도록 변경
            enableTextSend();
        }else{
            // 채팅 입력 시 글자수가 없으면 전송이 불가능하도록 변경
            disableTextSend();
        }
    }
})



// 현재 로그인 상태를 체크해준다.
firebase.auth().onAuthStateChanged(function (user) {
    showLoading();
    if (user) {
        // 로그인 상태일 경우 실행된다.
        if(!isLogined){
            // 필요한 데이터를 불러온다.
            loadData();
        }
    }else{
        // 로그인이 안돼있는 경우 실행된다.
        hideLoading();
    }
});

// 회원가입을 진행한다.
function signup(){
    showLoading();
    firebase.auth().createUserWithEmailAndPassword(getEmail(), getPassword())
    .then(
        function(user){
            // 회원가입이 완료 되었으면 회원 정보를 DB에 저장한다.
            upLoadNickname().then(function(success){
                // DB에 저장한 후 데이터를 불러온다.
                isLogined = true;
                loadData();
            }, function(error){
                hideLoading();
            })
        },
        function(error){
            if(error.code == "auth/email-already-in-use"){
                // 이미 해당 회원이 있으면 로그인을 진행한다.
                signin();
                return;
            }else if(error.code == "auth/invalid-email"){
                // 사용불가능한 이메일일 경우 발생한다.
                // 에러문구 발생
                showErrorLog();
            }else if(error.code == "auth/weak-password"){
                // 사용불가능한 비밀번호일 경우 발생한다.
                // 에러문구 발생
                showErrorLog();
            }
            hideLoading();
        }
    )
}

// 로그인을 진행한다.
function signin(){
    firebase.auth().signInWithEmailAndPassword(getEmail(), getPassword())
    .then(
        function(success) {
            isLogined = true;
            loadData();
        },
        function(error){
            // 로그인에 실패할 경우 발생
            // 에러문구 발생
            showErrorLog();
            hideLoading();
        }
    );
}

// 사용자 입장 여부를 체크 한다.
function onlineCheck(){
    // DB에서 UsersConnection/$Uid/connection 접근 경로를 설정한다.
    var myConnectionsRef = firebase.database().ref('UsersConnection/'+getCurrentUid()+'/connection');

    // DB에서 .info/connected 접근 경로를 설정한다.
    var connectedRef = firebase.database().ref('.info/connected');
    connectedRef.on('value', function(snap) {
        if (snap.val() === true){
            // DB 접근이 허용될 경우 실행

            // 해당 사용자의 connection 여부를 true로 변경시킨다.
            myConnectionsRef.set(true).then(function(){
                // DB에서 UsersConnection/ 이후 데이터의 변화를 감지한다.
                UsersConnectionChangeListenner();

                // DB에서 UsersConnection/ 이후의 새로운 데이터 추가를 감지한다.
                UsersConnectionAddListenner();
            });

            // 해당 사용자의 connection이 끊어지면 false로 변경시켜준다.
            myConnectionsRef.onDisconnect().set(false);
            
        }
    })
}


// 현재 접속자 데이터를 업데이트한다.
function getOnlineUser(){
    // DB의 UsersConnection/$uid/connection 경로에 true값들의 수를 가져온다.
    firebase
        .database()
        .ref('UsersConnection/')
        .orderByChild("connection")
        .equalTo(true)
        .once(
            'value', 
            function(snap){
                // 입장 인원을 WEB에 보여준다.
                setOnlineNumber(Object.keys(snap.val()).length);
            },
            function(error){
                console.log(error);
            }
        )
}

// 로그인 화면이 사라지면서 채팅화면이 나타난다.
function hideLoginShowChat(){
    hideKakaoLoginWrapper();
    showChatWrapper();

    // 접속한 정보를 알려준다.
    onlineCheck();

    // 로그인 입력을 초기화한다.
    resetLogin();
}

// 채팅화면이 사라지면서 로그인 화면이 나타난다.
function showLoginHideChat(){
    showKakaoLoginWrapper();
    hideChatWrapper();
    // 기존 데이터 제거
    removeChatData();
}

// 로그인 버튼 클릭시 실행
$("#login-btn").click(
    function(){
        if($("#login-btn").hasClass("enable-login")){
            // 로그인 활성화 시 실행
            signup();
        }
    }
)

// 로그아웃 버튼 클릭시 실행
$("#logout-btn").click(
    function(){
        // 사용사 접속 여부 변경
        var myConnectionsRef = firebase.database().ref('UsersConnection/'+getCurrentUid()+'/connection');
        myConnectionsRef.set(false);
       
        // 로그아웃 체크
        isLogined = false;
        
        // 로그아웃 실행
        firebase.auth().signOut();

        // 로그인 화면으로 변경
        showLoginHideChat();
    }
)

// 전송 버튼 클릭 시 실행
$("#text-send").click(
    function(){
        // 채팅 데이터 전송
        sendText();
    }
)

// 수정 버튼 클릭시 실행
$("#user-nic-modify").click(
    function(){
        // 입력을 위한 Prompt창을 띄워준다.
        var modifyNic = prompt("수정하실 닉네임을 작성하여주세요.");

        if(modifyNic.length > 1 && modifyNic.length < 7){
            // 닉네임이 2~6글자로 입력 시 실행

            // 해당 닉네임을 DB에 수정한다.
            updateNickname(modifyNic).then(function(success){
                // 수정된 닉네임을 WEB에서 변경한다.
                setNicknameWeb(modifyNic);

                // 수정 완료에 대한 알림창을 띄운다.
                alert("수정이 완료되었습니다.");
            }, function(error){
                // 수정 시 에러발생에 대한 알림창을 띄운다.
                alert("수정에 실패하였습니다.");
            })
        }else{
            // 닉네임이 2~6글자로 입력이 아닐 시 실행
            alert("수정에 실패하였습니다.");
        }
    }
)

// 채팅 데이터를 전송한다.
function sendText(){
    if(getInputChat().length > 0){
        // 채팅 데이터가 있으면 전송한다.
        // 채팅 데이터를 DB에 저장
        upLoadChat(getInputChat());

        // 채팅 내용을 공백으로 변경 초기화
        $("#input-chat").val("");

        // 전송이 불가능하도록 변경
        disableTextSend();
    }
}

// 닉네임 변경사항을 DB에 업로드한다.
function upLoadNickname(uid){
    return firebase.database().ref("users/" +getCurrentUid()).set({
        email: getEmail(),
        nickName : getEmail()
    });
}

// 채팅 내용을 DB에 업로드 한다.
function upLoadChat(contents){
    // 닉네임과 함께 데이터를 저장하기 위해 닉네임을 얻은 후 실행한다.
    getNickname().once('value').then(function(success){

        // 채팅 데이터를 입력 시간을 통해 DB에 저장한다.
        // 저장 데이터는 닉네임, 이메일, 채팅 내용, 사용자 Uid이다.
        firebase.database().ref("chat/"+Date.now())
        .update({
            nickName: success.val(),
            email: firebase.auth().currentUser.email,
            contents: contents,
            uid: getCurrentUid()
        });
    });

    // 채팅 내용을 WEB에 보여준다.
    makeMyChat(contents);
}

// 나의 채팅 내용을 WEB에 보이도록 한다.
function makeMyChat(contents){
    $("#chat-contents-wrapper").append(
        "<div>"+
            "<div class='my-chat'>"+
                "<pre class='my-chat-contents'>"+contents+"</pre>"+
            "</div>"+
        "</div>"
    )
    scrollBottom();
}

// 상대의 채팅 내용을 WEB에 보이도록 한다.
function makeOtherChat(nickName, contents){
    $("#chat-contents-wrapper").append(
        "<div>"+
            "<div class='other-chat'>"+
                "<pre class='other-nic'>"+nickName+"</pre>"+
                "<pre class='other-chat-contents'>"+contents+"</pre>"+
            "</div>"+
        "</div>"
    )
    scrollBottom();
}

// 수정 닉네임을 DB에 저장한다.
function updateNickname(nickName){
    return firebase.database().ref("users/"+getCurrentUid()).update({nickName: nickName});
}

// 현재 사용자의 닉네임을 얻어온다.
function getNickname(){
    return firebase.database().ref("users/"+getCurrentUid()+"/nickName");
}

// 로그인 시 사용자의 데이터를 가져온다.
function loadData(){
    // 닉네임을 가져온다.
    getNickname().once('value').then(function(success){
        // 닉네임을 WEB에 추가해준다.
        setNicknameWeb(success.val());

        // 로그인 화면이 사라지고 채팅 창이 나타난다.
        hideLoginShowChat();

        hideLoading();

        // 채팅 내용이 DB에서 업데이트 되면 실행된다.
        chatDBListenner();
    },function(error){
        showLoginHideChat();
        hideLoading();
    });
}

// 채팅 내용이 DB에서 업데이트를 감지한다.
function chatDBListenner(){
    firebase.database().ref("chat/")
    .orderByKey()
    .startAt(Date.now()+"")
    .on('child_added', function(success){
        receiveChatData = success.val();
        
        if(receiveChatData.uid != getCurrentUid()){
            // 자신의 Uid와 다를 경우 실행된다.
            // 다른 사용자의 채팅을 감지한다.

            // 다란 사용자의 채팅을 WEB에 보여준다.
            makeOtherChat(receiveChatData.nickName, receiveChatData.contents);
        }
    });
}

// DB에서 사용자 접속 데이터의 변화를 감지한다.
function UsersConnectionChangeListenner(){
    firebase
    .database()
    .ref('UsersConnection/')
    .on(
        'child_changed', 
        function(snap){
            // 데이터의 변화가 감지되면 현재 입장한 사용자 데이터를 업데이트한다.
            getOnlineUser();
        },
        function(error){
            console.log(error);
        }
    );
}

// DB에서 사용자 접속 데이터의 새로운 추가를 감지한다.
function UsersConnectionAddListenner(){
    firebase
    .database()
    .ref('UsersConnection/')
    .on(
        'child_added', 
        function(snap){
            // 새로운 데이터가 추가되면 현재 입장한 사용자 데이터를 업데이트한다.
            getOnlineUser();
        },
        function(error){
            console.log(error);
        }
    );
}