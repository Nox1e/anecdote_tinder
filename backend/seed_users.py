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
                "favorite_joke": "Вести подсчёт пчёл в улье может быть довольно опасно. Раз, два - и опчёлся"
            },
            {
                "email": "mark@facebook.com",
                "username": "zuckerberg",
                "password": "password123",
                "display_name": "Марк Цукерберг",
                "gender": GenderEnum.MALE,
                "bio": "Основатель Facebook (Meta). Создаю виртуальные миры и соединяю людей по всему миру.",
                "hobbies": "Программирование, виртуальная реальность, фехтование, изучение мандаринского",
                "favorite_joke": "- Оператор поддержки! Слушаю вас\n- У меня икота\n- Понял. Перевожу на Федота.\n- Но я и есть Федот!\n- Понял. Перевожу на Якова."
            },
            {
                "email": "donald@trump.com",
                "username": "realdonaldtrump",
                "password": "password123",
                "display_name": "Дональд Трамп",
                "gender": GenderEnum.MALE,
                "bio": "45-й президент США, бизнесмен, строитель. Делаю Америку снова великой!",
                "hobbies": "Гольф, строительство небоскребов, телевидение, Twitter",
                "favorite_joke": "В бар заходит простое число математиков и каждый заказывает по кружке пива. В это время в бар заходит бедняк с пустой кружкой и просит математиков отдать ему немного своего пива. Но они не делятся."
            },
            {
                "email": "vladimir@kremlin.ru",
                "username": "putin",
                "password": "password123",
                "display_name": "Владимир Путин",
                "gender": GenderEnum.MALE,
                "bio": "Президент Российской Федерации. Занимаюсь дзюдо и хоккеем на высшем уровне.",
                "hobbies": "Дзюдо, хоккей, рыбалка, езда на лошадях",
                "favorite_joke": "Насколько сложно на черном рынке продать почку?\nЛегче лёгкого"
            },
            {
                "email": "steve@apple.com",
                "username": "stevejobs",
                "password": "password123",
                "display_name": "Стив Джобс",
                "gender": GenderEnum.MALE,
                "bio": "Сооснователь Apple. Революционизирую технологии и дизайн. Think Different.",
                "hobbies": "Дизайн, каллиграфия, дзен-буддизм, минимализм",
                "favorite_joke": "Что общего у программистов и проституток?\nБолит жопа от разработки"
            },
            {
                "email": "bill@microsoft.com",
                "username": "billgates",
                "password": "password123",
                "display_name": "Билл Гейтс",
                "gender": GenderEnum.MALE,
                "bio": "Сооснователь Microsoft, филантроп. Борюсь с бедностью и болезнями через благотворительность.",
                "hobbies": "Чтение, благотворительность, теннис, игра в бридж",
                "favorite_joke": "Во время пробежки Штирлиц остановился, чтобы перевести дух.\n— Spirit, — перевёл Штирлиц и побежал дальше."
            },
            {
                "email": "jeff@amazon.com",
                "username": "jeffbezos",
                "password": "password123",
                "display_name": "Джефф Безос",
                "gender": GenderEnum.MALE,
                "bio": "Основатель Amazon и Blue Origin. Доставляю счастье людям и мечтаю о космосе.",
                "hobbies": "Космические полеты, чтение научной фантастики, инновации",
                "favorite_joke": "Два еврея поспорили, кто из них меньше пожертвует денег. Когда мимо проходил служитель первый еврей положил копейку и победоносно посмотрел на второго.\n— За двоих, — смиренно произнес второй и перекрестился."
            },
            {
                "email": "warren@berkshire.com",
                "username": "warrenbuffett",
                "password": "password123",
                "display_name": "Уоррен Баффет",
                "gender": GenderEnum.MALE,
                "bio": "Инвестор, 'Оракул из Омахи'. Инвестирую в долгосрочную перспективу и пью много Coca-Cola.",
                "hobbies": "Чтение годовых отчетов, игра на укулеле, мост, благотворительность",
                "favorite_joke": "Деревенский кузнец сказал новому подмастерью:\n— Сейчас выну из огня подкову. Как кивну головой, бей по ней со всей дури молотом.\nТак новичок–подмастерье сразу стал кузнецом."
            },
            {
                "email": "barack@whitehouse.gov",
                "username": "barackobama",
                "password": "password123",
                "display_name": "Барак Обама",
                "gender": GenderEnum.MALE,
                "bio": "44-й президент США. Yes We Can! Продолжаю вдохновлять людей на перемены.",
                "hobbies": "Баскетбол, написание мемуаров, публичные выступления",
                "favorite_joke": "На собеседовании:\n-Ваша главная слабость?\n-Правильно интерпретирую семантику вопроса, но игнорирую его суть.\n-Не могли бы вы привести пример?\n-Мог бы."
            },
            {
                "email": "angela@bundestag.de",
                "username": "merkel",
                "password": "password123",
                "display_name": "Ангела Меркель",
                "gender": GenderEnum.FEMALE,
                "bio": "Бывший канцлер Германии. Физик по образованию, политик по призванию.",
                "hobbies": "Опера, пешие прогулки, приготовление пищи",
                "favorite_joke": "Оппозиционеры никогда не ложатся спать вовремя, потому что не собираются соблюдать режим"
            },
            {
                "email": "taylor@swiftmusic.com",
                "username": "taylorswift",
                "password": "password123",
                "display_name": "Тейлор Свифт",
                "gender": GenderEnum.FEMALE,
                "bio": "Певица, автор песен. Пишу песни о своей жизни и превращаю боль в искусство.",
                "hobbies": "Написание песен, игра на гитаре, выпечка печенья для друзей",
                "favorite_joke": "Мужик съел дрожжи и теперь ходит-бродит"
            },
            {
                "email": "leo@hollywood.com",
                "username": "leodicaprio",
                "password": "password123",
                "display_name": "Леонардо ДиКаприо",
                "gender": GenderEnum.MALE,
                "bio": "Актёр и защитник окружающей среды. Наконец получил своего 'Оскара'!",
                "hobbies": "Защита окружающей среды, коллекционирование искусства, путешествия",
                "favorite_joke": "Вместо привычного голубя в окно влетела голая сова.\n\n\"Голосовуха\" - подумал Штирлиц"
            },
            {
                "email": "cristiano@football.com",
                "username": "cristiano",
                "password": "password123",
                "display_name": "Криштиану Роналду",
                "gender": GenderEnum.MALE,
                "bio": "Футболист, многократный обладатель 'Золотого мяча'. SIUUU!",
                "hobbies": "Футбол, тренировки, семья, благотворительность",
                "favorite_joke": "– Шах и мат нахуй!\n– А давайте-ка без мата!\n– Шах и нахуй!"
            },
            {
                "email": "sergey@google.com",
                "username": "sergeybrin",
                "password": "password123",
                "display_name": "Сергей Брин",
                "gender": GenderEnum.MALE,
                "bio": "Сооснователь Google. Организую мировую информацию и делаю её доступной.",
                "hobbies": "Полеты на дирижабле, гимнастика, исследования",
                "favorite_joke": "Моя девушка ушла от меня. Может я достал её тупыми каламбурами? Уж не знаю на шутку ли она разозлилась, но разозлилась она не на шутку"
            },
            {
                "email": "larry@google.com",
                "username": "larrypage",
                "password": "password123",
                "display_name": "Ларри Пейдж",
                "gender": GenderEnum.MALE,
                "bio": "Сооснователь Google и Alphabet. Мечтаю о летающих машинах и бессмертии.",
                "hobbies": "Инвестиции в будущее, кайтсёрфинг, музыка",
                "favorite_joke": "Ватсон пошёл в туалет. Возвращается и говорит:\n— Странный у вас туалет Холмс, открываешь дверь, свет горит, закрываешь, свет гаснет.\n— Сдаётся мне Ватсон вы в холодильник насрали"
            }
        ]
        
        print(f"Creating {len(celebrities)} celebrity users...")
        
        for celeb_data in celebrities:
            # Create user
            user = User(
                email=celeb_data["email"],
                username=celeb_data["username"],
                hashed_password=get_password_hash(celeb_data["password"]),
                is_celebrity=True
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
