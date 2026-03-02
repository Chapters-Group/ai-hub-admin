import asyncio

from passlib.context import CryptContext
from sqlalchemy import select

from app.config import settings
from app.database import async_session_factory
from app.models.admin_user import AdminUser

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed_admin():
    async with async_session_factory() as db:
        result = await db.execute(select(AdminUser).where(AdminUser.email == settings.ADMIN_EMAIL))
        if result.scalar_one_or_none():
            print(f"Admin user {settings.ADMIN_EMAIL} already exists.")
            return

        user = AdminUser(
            email=settings.ADMIN_EMAIL,
            hashed_password=pwd_context.hash(settings.ADMIN_PASSWORD),
            name="Super Admin",
            role="super_admin",
        )
        db.add(user)
        await db.commit()
        print(f"Created admin user: {settings.ADMIN_EMAIL}")


if __name__ == "__main__":
    asyncio.run(seed_admin())
