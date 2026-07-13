namespace api.fluvimar.domain.Entities.Commun
{
    public abstract class AbstractEntity
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public string CreatedByUserId { get; private set; } = string.Empty;
        public DateTime CreateAt { get; private set; } = DateTime.UtcNow;
        public string UpdatedByUserId { get; private set; } = string.Empty;
        public DateTime UpdateAt { get; private set; } = DateTime.UtcNow;
        public bool IsActive { get; private set; } = true;

        protected AbstractEntity() { }

        protected AbstractEntity(string userId)
        {
            CreatedByUserId = userId ?? throw new ArgumentNullException(nameof(userId));
            UpdatedByUserId = userId ?? throw new ArgumentNullException(nameof(userId));
        }

        public virtual void Activate(string userId)
        {
            UpdatedByUserId = userId ?? throw new ArgumentNullException(nameof(userId));
            IsActive = true;
        }

        public virtual void Deactivate(string userId)
        {
            IsActive = false;
            UpdatedByUserId = userId ?? throw new ArgumentNullException(nameof(userId));
        }

        public void Update(string userId)
        {
            UpdatedByUserId = userId ?? throw new ArgumentNullException(nameof(userId));
            UpdateAt = DateTime.UtcNow;
        }
    }
}
