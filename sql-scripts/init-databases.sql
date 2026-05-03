-- ========================================
-- Docker Init Script for UniLife Hub
-- ========================================

WAITFOR DELAY '00:00:15';
GO

-- ==================== AUTHENTICATION1_DB ====================
USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'authentication1_db')
BEGIN
    CREATE DATABASE authentication1_db;
END
GO

USE authentication1_db;
GO

-- Table credentials
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'credentials')
BEGIN
    CREATE TABLE [dbo].[credentials](
        [id] [uniqueidentifier] NOT NULL DEFAULT (newid()),
        [email] [nvarchar](255) NOT NULL,
        [password_hash] [nvarchar](max) NOT NULL,
        [is_active] [bit] NOT NULL DEFAULT ((0)),
        [created_at] [datetime2](7) NOT NULL DEFAULT (getutcdate()),
        [updated_at] [datetime2](7) NULL,
        [Role] [int] NOT NULL DEFAULT ((0)),
        PRIMARY KEY CLUSTERED ([id] ASC),
        UNIQUE NONCLUSTERED ([email] ASC)
    );
END
GO

-- Table refresh_tokens
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'refresh_tokens')
BEGIN
    CREATE TABLE [dbo].[refresh_tokens](
        [id] [uniqueidentifier] NOT NULL DEFAULT (newid()),
        [user_id] [uniqueidentifier] NOT NULL,
        [token] [nvarchar](max) NOT NULL,
        [expires_at] [datetime2](7) NOT NULL,
        [created_at] [datetime2](7) NOT NULL DEFAULT (getutcdate()),
        PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_RefreshToken_Credential] FOREIGN KEY([user_id])
            REFERENCES [dbo].[credentials] ([id])
            ON DELETE CASCADE
    );
END
GO

-- Table password_resets
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'password_resets')
BEGIN
    CREATE TABLE [dbo].[password_resets](
        [id] [uniqueidentifier] NOT NULL DEFAULT (newid()),
        [user_id] [uniqueidentifier] NOT NULL,
        [email] [nvarchar](255) NOT NULL,
        [token] [nvarchar](max) NOT NULL,
        [expires_at] [datetime2](7) NOT NULL,
        [used] [bit] NOT NULL DEFAULT ((0)),
        [created_at] [datetime2](7) NOT NULL DEFAULT (getutcdate()),
        PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_PasswordReset_Credential] FOREIGN KEY([user_id])
            REFERENCES [dbo].[credentials] ([id])
            ON DELETE CASCADE
    );
END
GO

-- Table token_blacklist
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'token_blacklist')
BEGIN
    CREATE TABLE [dbo].[token_blacklist](
        [id] [uniqueidentifier] NOT NULL DEFAULT (newid()),
        [token] [nvarchar](max) NOT NULL,
        [blacklisted_at] [datetime2](7) NOT NULL DEFAULT (getutcdate()),
        PRIMARY KEY CLUSTERED ([id] ASC)
    );
END
GO

-- ==================== USER_SERVICE_DB ====================
USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'user_service_db')
BEGIN
    CREATE DATABASE user_service_db;
END
GO

USE user_service_db;
GO

-- Table users
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE [dbo].[users](
        [Id] [uniqueidentifier] NOT NULL,
        [CredentialId] [uniqueidentifier] NOT NULL,
        [Name] [nvarchar](255) NOT NULL,
        [Email] [nvarchar](255) NOT NULL,
        [Phone] [nvarchar](20) NULL,
        [AvatarUrl] [nvarchar](500) NULL,
        [University] [nvarchar](255) NULL,
        [StudentId] [nvarchar](50) NULL,
        [AcademicYear] [nvarchar](50) NULL,
        [Bio] [nvarchar](1000) NULL,
        [Role] [int] NOT NULL,
        [IsVerified] [bit] NOT NULL,
        [IsActive] [bit] NOT NULL,
        [IsBlocked] [bit] NOT NULL,
        [BlockedReason] [nvarchar](500) NULL,
        [BlockedUntil] [datetime2](7) NULL,
        [CreatedAt] [datetime2](7) NOT NULL,
        [UpdatedAt] [datetime2](7) NULL,
        [LastLogin] [datetime2](7) NULL,
        CONSTRAINT [PK_users] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
END
GO

-- Table user_profiles
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_profiles')
BEGIN
    CREATE TABLE [dbo].[user_profiles](
        [Id] [uniqueidentifier] NOT NULL,
        [UserId] [uniqueidentifier] NOT NULL,
        [DateOfBirth] [datetime2](7) NULL,
        [Address] [nvarchar](255) NULL,
        [City] [nvarchar](100) NULL,
        [Country] [nvarchar](100) NULL,
        CONSTRAINT [PK_user_profiles] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_user_profiles_users_UserId] FOREIGN KEY([UserId])
            REFERENCES [dbo].[users] ([Id])
            ON DELETE CASCADE
    );
END
GO

-- Table user_preferences
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_preferences')
BEGIN
    CREATE TABLE [dbo].[user_preferences](
        [Id] [uniqueidentifier] NOT NULL,
        [UserId] [uniqueidentifier] NOT NULL,
        [Language] [nvarchar](10) NOT NULL,
        [Timezone] [nvarchar](50) NOT NULL,
        [EmailNotifications] [bit] NOT NULL,
        [PushNotifications] [bit] NOT NULL,
        CONSTRAINT [PK_user_preferences] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_user_preferences_users_UserId] FOREIGN KEY([UserId])
            REFERENCES [dbo].[users] ([Id])
            ON DELETE CASCADE
    );
END
GO

-- ==================== SOCIAL DB ====================
USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'SocialDb')
BEGIN
    CREATE DATABASE SocialDb;
END
GO

-- ==================== COURSES FORMATIONS DB ====================
USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'courses_formations_db')
BEGIN
    CREATE DATABASE courses_formations_db;
END
GO