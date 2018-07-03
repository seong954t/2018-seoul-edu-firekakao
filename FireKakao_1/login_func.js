// 로딩창을 띄운다.
function showLoading(){
    $("#spinner-warpper").show();
}

// 로딩창을 없앤다.
function hideLoading(){
    $("#spinner-warpper").hide();
}

function getEmail(){
    return $("#kakao-email").val();
}

function getPassword(){
    return $("#kakao-pw").val();
}

firebase.auth().onAuthStateChanged(function (user) {
    showLoading();
    if (user) {
        location.href = './chat.html'
    }else{
        hideLoading();
    }
});

function signup(){
    showLoading()
    firebase.auth().createUserWithEmailAndPassword(getEmail(), getPassword())
    .then(
        function(user){
            hideLoading();
        },
        function(error){
            if(error.code == "auth/email-already-in-use"){
                signin();
                return;
            }else if(error.code == "auth/invalid-email"){
                alert("사용가능하지 않은 이메일 형식입니다.")
            }else if(error.code == "auth/weak-password"){
                alert("비밀번호가 취약합니다.");
            }
            hideLoading();
        }
    )
}

function signin(){
    firebase.auth().signInWithEmailAndPassword(getEmail(), getPassword())
    .then(
        function(success) {
            hideLoading();
        },
        function(error){
            hideLoading();
        }
    );
}

$('.kakao-login').keyup(function(event){
    if(event.keyCode === 13){
        $('#login-btn').click();
    }
});

$("#login-btn").click(
    function(){
        signup();
    }
)