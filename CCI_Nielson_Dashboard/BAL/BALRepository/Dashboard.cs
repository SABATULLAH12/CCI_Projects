using DAL;

namespace BAL
{
    public class Dashboard : IDashboard
    {
        internal readonly IUnitOfWork _unitOfWork;

        public Dashboard(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public string Dummy()
        {
            return _unitOfWork.GetRepository<IDashboardRepository>().Dummy();
        }
    }
}
