using DAL;
using System.Data;
using Entities;
using System.Collections.Generic;
using System.Linq;

namespace BAL
{
    public class Login : ILogin
    {
        internal readonly IUnitOfWork _unitOfWork;

        public Login(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public UserDetails GetUserDetails(int userId)
        {
            UserDetails userDetails = new UserDetails();
            DataSet ds = _unitOfWork.GetRepository<ILoginRepository>().LoginDetails(userId);
            if (ds.Tables.Count > 0)
            {
                if (ds.Tables[0].Rows.Count > 0)
                {
                    userDetails.FirstName = ds.Tables[0].Rows[0]["FirstName"].ToString();
                    userDetails.Email = ds.Tables[0].Rows[0]["EmailId"].ToString();
                    userDetails.IsSSO = (bool)ds.Tables[0].Rows[0]["IsSSOUser"];
                    userDetails.Role = ds.Tables[0].Rows[0]["UserRole"].ToString();
                }
                else
                {
                    throw new DataException("No Rows for this User is Available");
                }
            }
            return userDetails;
        }

    }
}
