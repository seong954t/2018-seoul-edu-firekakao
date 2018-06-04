var isLogined = false;
$('.kakao-login').keyup(function(event){
    if(event.keyCode === 13){
        $('#login-btn').click();
    }else{
        hideErrorLog();
        if(getPassword().length > 5){
            enableLogin();
        }else{
            disableLogin();
        }
    }
});

firebase.auth().onAuthStateChanged(function (user) {
    showLoading();
    if (user) {
        if(!isLogined){
            loadData();
        }
    }else{
        hideLoading();
    }
});

function signup(){
    showLoading();
    firebase.auth().createUserWithEmailAndPassword(getEmail(), getPassword())
    .then(
        function(user){
            upLoadNickname(user.user.uid).then(function(success){
                isLogined = true;
                loadData();
            }, function(error){
                hideLoading();
            })
        },
        function(error){
            if(error.code == "auth/email-already-in-use"){
                signin();
                return;
            }else if(error.code == "auth/invalid-email"){
                showErrorLog();
            }else if(error.code == "auth/weak-password"){
                showErrorLog();
            }
            hideLoading();
        }
    )
}

function signin(){
    firebase.auth().signInWithEmailAndPassword(getEmail(), getPassword())
    .then(
        function(success) {
            isLogined = true;
            loadData();
        },
        function(error){
            showErrorLog();
            showErrorLog();
            hideLoading();
        }
    );
}

function getEmail(){
    return $("#kakao-email")[0].value;
}

function getPassword(){
    return $("#kakao-pw")[0].value;
}

function onlineCheck(){
    var myConnectionsRef = firebase.database().ref('UsersConnection/'+firebase.auth().getUid()+'/connection');

    var connectedRef = firebase.database().ref('.info/connected');
    connectedRef.on('value', function(snap) {
        if (snap.val() === true){
            myConnectionsRef.set(true).then(function(){
                firebase
                    .database()
                    .ref('UsersConnection/')
                    .on(
                        'child_changed', 
                        function(snap){
                            getOnlineUser();
                        },
                        function(error){
                            console.log(error);
                        }
                    );
                firebase
                    .database()
                    .ref('UsersConnection/')
                    .on(
                        'child_added', 
                        function(snap){
                            getOnlineUser();
                        },
                        function(error){
                            console.log(error);
                        }
                    );
            });
            myConnectionsRef.onDisconnect().set(false);
            
        }
    })
}

function getOnlineUser(){
    firebase
        .database()
        .ref('UsersConnection/')
        .orderByChild("connection")
        .equalTo(true)
        .once(
            'value', 
            function(snap){
                $("#online-num")[0].innerText = Object.keys(snap.val()).length;
            },
            function(error){
                console.log(error);
            }
        )
}

function hideLoginShowChat(){
    $("#kakao-wrapper").removeClass("show-kakao-wrapper");
    $("#kakao-wrapper").addClass("hide-kakao-wrapper");
    $("#kakao-chat-wrapper").removeClass("hide-kakao-chat-wrapper");
    $("#kakao-chat-wrapper").addClass("show-kakao-chat-wrapper");
    onlineCheck();
    resetLogin();
}

function showLoginHideChat(){
    $("#kakao-wrapper").removeClass("hide-kakao-wrapper");
    $("#kakao-wrapper").addClass("show-kakao-wrapper");
    $("#kakao-chat-wrapper").removeClass("show-kakao-chat-wrapper");
    $("#kakao-chat-wrapper").addClass("hide-kakao-chat-wrapper");
}

function resetLogin(){
    $("#kakao-email")[0].value = "";
    $("#kakao-pw")[0].value = "";
}

$("#login-btn").click(
    function(){
        if($("#login-btn").hasClass("enable-login")){
            signup();
        }
    }
)

$("#logout-btn").click(
    function(){
        showLoginHideChat();
        removeChatData();
        firebase.auth().signOut();
        isLogined = false;
        var myConnectionsRef = firebase.database().ref('UsersConnection/'+firebase.auth().getUid()+'/connection');
        myConnectionsRef.set(false);
    }
)

$("#text-send").click(
    function(){
        sendText();
    }
)

$("#user-nic-modify").click(
    function(){
        var modifyNic = prompt("수정하실 닉네임을 작성하여주세요.");
        if(modifyNic.length > 1 && modifyNic.length < 7){
            updateNickname(modifyNic).then(function(success){
                $("#user-nic")[0].innerText = modifyNic;
                alert("수정이 완료되었습니다.");
            }, function(error){
                alert("수정에 실패하였습니다.");
            })
        }else{
            alert("수정에 실패하였습니다.");
        }
    }
)

$("#input-chat").keyup(function(event){
    if(event.keyCode == 8){
        if($("#input-chat").val().length <= 1){
            $("#text-send").addClass("disable-text-send");
            $("#text-send").removeClass("enable-text-send");
        }
    }else{
        if($("#input-chat").val().length > 0){
            $("#text-send").removeClass("disable-text-send");
            $("#text-send").addClass("enable-text-send");
        }
    }
})

$("#input-chat").keypress(function(event){
    if (event.keyCode == 13) {       
        if(!event.shiftKey){
            event.preventDefault();
            sendText();
        }
    }else{
        if($("#input-chat").val().length > 0){
            $("#text-send").removeClass("disable-text-send");
            $("#text-send").addClass("enable-text-send");
        }else{
            $("#text-send").addClass("disable-text-send");
            $("#text-send").removeClass("enable-text-send");
        }
    }
})

function sendText(){
    if($("#input-chat").val().length > 0){
        upLoadChat($("#input-chat").val());
        $("#input-chat").val("");
        $("#text-send").addClass("disable-text-send");
        $("#text-send").removeClass("enable-text-send");
    }
}

function showLoading(){
    $("#spinner-warpper").show();
}

function hideLoading(){
    $("#spinner-warpper").hide();
}

function showErrorLog(){
    $("#login-err").show();
}

function hideErrorLog(){
    $("#login-err").hide();
}

function removeChatData(){
    $("#chat-contents-wrapper").children().remove();
}

function enableLogin(){
    $("#login-btn").addClass("enable-login");
    $("#login-btn").removeClass("disable-login");
}
function disableLogin(){
    $("#login-btn").removeClass("enable-login");
    $("#login-btn").addClass("disable-login");
}

function upLoadNickname(uid){
    return firebase.database().ref("users/" + uid).set({
        email: getEmail(),
        nickName : getEmail()
    });
}

function upLoadChat(contents){
    getNickname().once('value').then(function(success){
        firebase.database().ref("chat/"+Date.now())
        .update({
            nickName: success.val(),
            email: firebase.auth().currentUser.email,
            contents: contents,
            uid: firebase.auth().getUid()
        });
    });

    
    makeMyChat(contents);
}

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

function updateNickname(nickName){
    return firebase.database().ref("users/"+firebase.auth().getUid()).update({nickName: nickName});
}

// function getNickname(){
//     return $("#user-nic").val();
// }

function getNickname(){
    return firebase.database().ref("users/"+firebase.auth().getUid()+"/nickName");
}

function loadData(){
    console.log("Aaaaaaa");
    getNickname().once('value').then(function(success){
        $("#user-nic")[0].innerText = success.val();
        hideLoginShowChat();
        hideLoading();
        firebase.database().ref("chat/")
            .orderByKey()
            .startAt(Date.now()+"")
            .on('child_added', function(success){
                receiveChatData = success.val();
                console.log(receiveChatData);
                if(receiveChatData.uid != firebase.auth().getUid()){
                    makeOtherChat(receiveChatData.nickName, receiveChatData.contents);
                }
            });
    },function(error){
        showLoginHideChat();
        hideLoading();
    });
}

function scrollBottom(){
    $("#chat-contents-wrapper").animate({ scrollTop: $("#chat-contents-wrapper")[0].scrollHeight }, "slow");
}