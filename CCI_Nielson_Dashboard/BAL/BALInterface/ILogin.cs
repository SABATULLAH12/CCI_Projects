using Entities;

namespace BAL
{
    public interface ILogin
    {
        UserDetails GetUserDetails(int userID);
    }
}
