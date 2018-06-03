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

function signup(){
    showLoading();
    firebase.auth().createUserWithEmailAndPassword(getEmail(), getPassword())
    .then(
        function(user){
            upLoadNickname(user.user.uid).then(function(success){
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

function hideLoginShowChat(){
    $("#kakao-wrapper").removeClass("show-kakao-wrapper");
    $("#kakao-wrapper").addClass("hide-kakao-wrapper");
    $("#kakao-chat-wrapper").removeClass("hide-kakao-chat-wrapper");
    $("#kakao-chat-wrapper").addClass("show-kakao-chat-wrapper");
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
            if($("#input-chat").val().length > 1){
                upLoadChat($("#input-chat").val());
                $("#input-chat").val("");
            }
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
                "<pre>내용 : "+contents+"</pre>"+
            "</div>"+
        "</div>"
    )
}

function makeOtherChat(nickName, contents){
    $("#chat-contents-wrapper").append(
        "<div>"+
            "<div class='other-chat'>"+
                "<pre>닉네임 : "+nickName+"</pre>"+
                "<pre>내용 : "+contents+"</pre>"+
            "</div>"+
        "</div>"
    )
}

function updateNickname(){
    return firebase.database().ref("users/"+firebase.auth().getUid()).update({nickName: getNickname()});
}

function getNickname(){
    return $("#user-nic").val();
}

function getNickname(){
    return firebase.database().ref("users/"+firebase.auth().getUid()+"/nickName");
}

function loadData(){
    getNickname().once('value').then(function(success){
        $("#user-nic")[0].innerText = success.val();
        hideLoginShowChat();
        hideLoading();
        firebase.database().ref("chat/")
            .orderByKey()
            .startAt(Date.now()+"")
            .on('child_added', function(success){
                receiveChatData = success.val();
                if(receiveChatData.uid != firebase.auth().getUid()){
                    makeOtherChat(receiveChatData.nickName, receiveChatData.contents);
                }
            });
    },function(error){
        showLoginHideChat();
        hideLoading();
    });
}