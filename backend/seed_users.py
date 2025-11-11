"""Seed script to populate database with celebrity user profiles."""

import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.db.session import SessionLocal, create_tables
from app.models.user import User
from app.models.profile import Profile, GenderEnum
from app.auth import get_password_hash


def seed_users():
    """Seed database with celebrity users."""
    db = SessionLocal()
    
    try:
        # Create tables if they don't exist
        create_tables()
        
        # Check if users already exist
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"Database already contains {existing_users} users. Skipping seed.")
            return
        
        celebrities = [
            {
                "email": "elon@tesla.com",
                "username": "elonmusk",
                "password": "password123",
                "display_name": "Илон Маск",
                "gender": GenderEnum.MALE,
                "bio": "Основатель Tesla, SpaceX, Neuralink. Мечтаю колонизировать Марс и сделать человечество мультипланетным видом.",
                "hobbies": "Ракетостроение, электромобили, искусственный интеллект, мемы",
                "favorite_joke": "Почему я запустил Tesla в космос? Потому что это единственное место, где нет пробок!"
            },
            {
                "email": "mark@facebook.com",
                "username": "zuckerberg",
                "password": "password123",
                "display_name": "Марк Цукерберг",
                "gender": GenderEnum.MALE,
                "bio": "Основатель Facebook (Meta). Создаю виртуальные миры и соединяю людей по всему миру.",
                "hobbies": "Программирование, виртуальная реальность, фехтование, изучение мандаринского",
                "favorite_joke": "Я создал Facebook, чтобы люди делились своей жизнью. Теперь они делятся мемами. Кажется, это работает!"
            },
            {
                "email": "donald@trump.com",
                "username": "realdonaldtrump",
                "password": "password123",
                "display_name": "Дональд Трамп",
                "gender": GenderEnum.MALE,
                "bio": "45-й президент США, бизнесмен, строитель. Делаю Америку снова великой!",
                "hobbies": "Гольф, строительство небоскребов, телевидение, Twitter",
                "favorite_joke": "Я построил лучшие здания, заключил лучшие сделки. И мои анекдоты? Они просто фантастические, поверьте мне!"
            },
            {
                "email": "vladimir@kremlin.ru",
                "username": "putin",
                "password": "password123",
                "display_name": "Владимир Путин",
                "gender": GenderEnum.MALE,
                "bio": "Президент Российской Федерации. Занимаюсь дзюдо и хоккеем на высшем уровне.",
                "hobbies": "Дзюдо, хоккей, рыбалка, езда на лошадях",
                "favorite_joke": "Медведь в тайге встречает туриста и спрашивает: 'Ты кто?' - 'Я турист из России!' - 'Ну ладно, проходи, своих не трогаю.'"
            },
            {
                "email": "steve@apple.com",
                "username": "stevejobs",
                "password": "password123",
                "display_name": "Стив Джобс",
                "gender": GenderEnum.MALE,
                "bio": "Сооснователь Apple. Революционизирую технологии и дизайн. Think Different.",
                "hobbies": "Дизайн, каллиграфия, дзен-буддизм, минимализм",
                "favorite_joke": "Почему я ношу черную водолазку? Потому что мне не нужно думать о том, что надеть. Больше времени на инновации!"
            },
            {
                "email": "bill@microsoft.com",
                "username": "billgates",
                "password": "password123",
                "display_name": "Билл Гейтс",
                "gender": GenderEnum.MALE,
                "bio": "Сооснователь Microsoft, филантроп. Борюсь с бедностью и болезнями через благотворительность.",
                "hobbies": "Чтение, благотворительность, теннис, игра в бридж",
                "favorite_joke": "Почему Windows такая популярная? Потому что всем нравится перезагружаться несколько раз в день для поддержания здоровья компьютера!"
            },
            {
                "email": "jeff@amazon.com",
                "username": "jeffbezos",
                "password": "password123",
                "display_name": "Джефф Безос",
                "gender": GenderEnum.MALE,
                "bio": "Основатель Amazon и Blue Origin. Доставляю счастье людям и мечтаю о космосе.",
                "hobbies": "Космические полеты, чтение научной фантастики, инновации",
                "favorite_joke": "Я начал Amazon в гараже. Теперь я могу купить все гаражи в мире. И да, доставка бесплатная!"
            },
            {
                "email": "warren@berkshire.com",
                "username": "warrenbuffett",
                "password": "password123",
                "display_name": "Уоррен Баффет",
                "gender": GenderEnum.MALE,
                "bio": "Инвестор, 'Оракул из Омахи'. Инвестирую в долгосрочную перспективу и пью много Coca-Cola.",
                "hobbies": "Чтение годовых отчетов, игра на укулеле, мост, благотворительность",
                "favorite_joke": "Я так богат, что могу купить любую компанию. Но знаете что? Я все еще живу в том же доме, что купил в 1958 году!"
            },
            {
                "email": "barack@whitehouse.gov",
                "username": "barackobama",
                "password": "password123",
                "display_name": "Барак Обама",
                "gender": GenderEnum.MALE,
                "bio": "44-й президент США. Yes We Can! Продолжаю вдохновлять людей на перемены.",
                "hobbies": "Баскетбол, написание мемуаров, публичные выступления",
                "favorite_joke": "Знаете, что самое сложное в том, чтобы быть президентом? Объяснять своим дочерям, почему я не могу просто издать указ о продлении каникул!"
            },
            {
                "email": "angela@bundestag.de",
                "username": "merkel",
                "password": "password123",
                "display_name": "Ангела Меркель",
                "gender": GenderEnum.FEMALE,
                "bio": "Бывший канцлер Германии. Физик по образованию, политик по призванию.",
                "hobbies": "Опера, пешие прогулки, приготовление пищи",
                "favorite_joke": "Я физик, поэтому когда говорю 'нет', это не отрицание, а просто отсутствие положительного результата в данном эксперименте!"
            },
            {
                "email": "taylor@swiftmusic.com",
                "username": "taylorswift",
                "password": "password123",
                "display_name": "Тейлор Свифт",
                "gender": GenderEnum.FEMALE,
                "bio": "Певица, автор песен. Пишу песни о своей жизни и превращаю боль в искусство.",
                "hobbies": "Написание песен, игра на гитаре, выпечка печенья для друзей",
                "favorite_joke": "Я пишу песни о своих бывших. Они говорят, что это странно. Я говорю, что это Grammy!"
            },
            {
                "email": "leo@hollywood.com",
                "username": "leodicaprio",
                "password": "password123",
                "display_name": "Леонардо ДиКаприо",
                "gender": GenderEnum.MALE,
                "bio": "Актёр и защитник окружающей среды. Наконец получил своего 'Оскара'!",
                "hobbies": "Защита окружающей среды, коллекционирование искусства, путешествия",
                "favorite_joke": "Знаете, сколько времени понадобилось, чтобы получить Оскара? Достаточно, чтобы Титаник затонул несколько раз!"
            },
            {
                "email": "cristiano@football.com",
                "username": "cristiano",
                "password": "password123",
                "display_name": "Криштиану Роналду",
                "gender": GenderEnum.MALE,
                "bio": "Футболист, многократный обладатель 'Золотого мяча'. SIUUU!",
                "hobbies": "Футбол, тренировки, семья, благотворительность",
                "favorite_joke": "Люди спрашивают, как я поддерживаю форму. Секрет прост: тренировки, дисциплина и фотографирование пресса для Instagram!"
            },
            {
                "email": "sergey@google.com",
                "username": "sergeybrin",
                "password": "password123",
                "display_name": "Сергей Брин",
                "gender": GenderEnum.MALE,
                "bio": "Сооснователь Google. Организую мировую информацию и делаю её доступной.",
                "hobbies": "Полеты на дирижабле, гимнастика, исследования",
                "favorite_joke": "Я создал поисковик, который знает ответы на все вопросы. Кроме одного: почему люди до сих пор спрашивают 'Как погода?'"
            },
            {
                "email": "larry@google.com",
                "username": "larrypage",
                "password": "password123",
                "display_name": "Ларри Пейдж",
                "gender": GenderEnum.MALE,
                "bio": "Сооснователь Google и Alphabet. Мечтаю о летающих машинах и бессмертии.",
                "hobbies": "Инвестиции в будущее, кайтсёрфинг, музыка",
                "favorite_joke": "Я мечтаю о мире, где все проблемы можно решить, просто нажав 'Мне повезёт!'"
            }
        ]
        
        print(f"Creating {len(celebrities)} celebrity users...")
        
        for celeb_data in celebrities:
            # Create user
            user = User(
                email=celeb_data["email"],
                username=celeb_data["username"],
                hashed_password=get_password_hash(celeb_data["password"])
            )
            db.add(user)
            db.flush()  # Flush to get user.id
            
            # Create profile
            profile = Profile(
                user_id=user.id,
                display_name=celeb_data["display_name"],
                gender=celeb_data["gender"],
                bio=celeb_data["bio"],
                hobbies=celeb_data["hobbies"],
                favorite_joke=celeb_data["favorite_joke"],
                is_active=True
            )
            db.add(profile)
            
            print(f"✓ Created user: {celeb_data['display_name']} ({celeb_data['username']})")
        
        db.commit()
        print(f"\n✅ Successfully created {len(celebrities)} users with profiles!")
        print("\nYou can login with any of these accounts using:")
        print("  Email: <username>@<domain>.com")
        print("  Password: password123")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_users()
