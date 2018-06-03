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
        function(success){
            hideLoginShowChat();
            hideLoading();
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
            hideLoginShowChat();
            hideLoading();
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