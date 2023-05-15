using System;
using System.Collections.Generic;

namespace DAL
{
    public class UnitOfWork : IUnitOfWork, IDisposable
    {
        internal Dictionary<Type, object> _repositories = new Dictionary<Type, object>();
        public UnitOfWork(IFilterPanelRepository filterPanelRepository,ICrossTabRepository crossTabRepository,IDashboardRepository dashboardRepository,IDeepdiveRepository deepdiveRepository,ILoginRepository loginRepository)
        {
            _repositories.Add(typeof(IFilterPanelRepository), filterPanelRepository);
            _repositories.Add(typeof(ICrossTabRepository), crossTabRepository);
            _repositories.Add(typeof(IDashboardRepository), dashboardRepository);
            _repositories.Add(typeof(IDeepdiveRepository), deepdiveRepository);
            _repositories.Add(typeof(ILoginRepository), loginRepository);
        }
        public T GetRepository<T>() where T : class
        {
            return _repositories[typeof(T)] as T;
        }

        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    // TODO: dispose managed state (managed objects).                    
                }

                // TODO: free unmanaged resources (unmanaged objects) and override a finalizer below.
                // TODO: set large fields to null.

                this.disposedValue = true;
            }
        }

        // TODO: override a finalizer only if Dispose(bool disposing) above has code to free unmanaged resources.
        // ~UnitOfWork() {
        //   // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
        //   Dispose(false);
        // }

        // This code added to correctly implement the disposable pattern.
        public void Dispose()
        {
            // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
            Dispose(true);
            // TODO: uncomment the following line if the finalizer is overridden above.
            // GC.SuppressFinalize(this);
        }
        #endregion
    }
}
