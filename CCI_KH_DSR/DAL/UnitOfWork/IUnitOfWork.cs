using System;

namespace DAL
{
    public interface IUnitOfWork : IDisposable
    {
        T GetRepository<T>() where T : class;
    }
}
