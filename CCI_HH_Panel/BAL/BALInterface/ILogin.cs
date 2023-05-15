using Entity;

namespace BAL {
    public interface ILogin {
        UserDetails GetUserDetails(int userId);
    }
}