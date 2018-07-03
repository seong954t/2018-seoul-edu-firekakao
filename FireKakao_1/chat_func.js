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

function scrollBottom(){
    $("#chat-contents-wrapper").stop().animate({ scrollTop: $("#chat-contents-wrapper")[0].scrollHeight }, "slow");
}

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        $("#user-nic").text(user.email);
        onlineCheck();
        chatDBListenner();
    }else{
        location.href = './login.html';
    }
});

function getCurrentEmail(){
    return firebase.auth().currentUser.email
}

function getCurrentUid(){
    return firebase.auth().currentUser.uid
}

function setOnlineNumber(onlineNum){
    $("#online-num").text(onlineNum);
}

// 채팅 내용을 DB에 업로드 한다.
function upLoadChat(contents){
    // 채팅 데이터를 입력 시간을 통해 DB에 저장한다.
    // 저장 데이터는 닉네임, 이메일, 채팅 내용, 사용자 Uid이다.
    firebase.database().ref("chat/"+Date.now())
    .update({
        email: getCurrentEmail(),
        contents: contents
    });

    // 채팅 내용을 WEB에 보여준다.
    makeMyChat(contents);
}

// 채팅 내용이 DB에서 업데이트를 감지한다.
function chatDBListenner(){
    firebase.database().ref("chat/")
    .orderByKey()
    .startAt(Date.now()+"")
    .on('child_added', function(success){
        var receiveChatData = success.val();
        
        if(receiveChatData.email != getCurrentEmail()){
            // 자신의 이메일과 다를 경우 실행된다.
            // 다른 사용자의 채팅을 감지한다.

            // 다란 사용자의 채팅을 WEB에 보여준다.
            makeOtherChat(receiveChatData.email, receiveChatData.contents);
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
                var onlineUser = Object.keys(snap.val()).length;
                setOnlineNumber(onlineUser);
            },
            function(error){
                console.log(error);
            }
        )
}

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

$("#logout-btn").click(
    function(){
        // 로그아웃 알림창을 띄워준다.
        if(confirm("로그아웃 하시겠습니까?")){
            // 사용사 접속 여부 변경
            var myConnectionsRef = firebase.database().ref('UsersConnection/'+getCurrentUid()+'/connection');
            myConnectionsRef.set(false);
            
            // 로그아웃 실행
            firebase.auth().signOut();
        }
    }
)

