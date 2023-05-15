//namespace Entity {
//    public class LoginInfo {
//        public bool IsAuthenticated { get; set; }
//        public AuthUserDetails UserInfo { get; set; }
//        public LoginInfo() {
//            IsAuthenticated = false;
//            UserInfo = new AuthUserDetails();
//        }
//        public LoginInfo(bool isAuthenticated, AuthUserDetails user) {
//            IsAuthenticated = isAuthenticated;
//            UserInfo = user;
//        }
//    }
//    public class Token {
//        public string value { get; set; }
//        public int epoch { get; set; }
//    }
//    public class AuthUserDetails {
//        public AuthUserDetails() {
//            IsSSO = false;
//        }
//        public string FirstName { get; set; }
//        public int UserId { get; set; }
//        public string LastName { get; set; }
//        public string Email { get; set; }
//        public bool IsSSO { get; set; }
//    }
//    public class UserDetails {
//        public UserDetails() {
//            IsSSO = false;
//        }
//        public string FirstName { get; set; }
//        public string LastName { get; set; }
//        public string Email { get; set; }
//        public bool IsSSO { get; set; }
//        public string Role { get; set; }
//    }
//}

namespace Entity {
    public class LoginInfo {
        public bool IsAuthenticated { get; set; }
        public UserDetails UserInfo { get; set; }
        public LoginInfo() {
            IsAuthenticated = false;
            UserInfo = new UserDetails();
        }
        public LoginInfo(bool isAuthenticated, UserDetails user) {
            IsAuthenticated = isAuthenticated;
            UserInfo = user;
        }
    }
    public class Token {
        public string value { get; set; }
        public int epoch { get; set; }
        public string appcode { get; set; }
    }

    public class UserDetails {
        public UserDetails() {
            IsSSO = false;
        }
        public string FirstName { get; set; }
        //public string LastName { get; set; }
        public string Email { get; set; }
        public bool IsSSO { get; set; }
        public string Role { get; set; }
    }
}
