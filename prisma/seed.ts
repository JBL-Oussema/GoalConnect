import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with GoalConnect stades (pitches)...')
  
  // Create a default User organizer since our relations require User
  // Create a default User organizer
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'password123', // Demo password
    },
  })


  const stades = [
    { id: 1, nom: 'Camp Nou', prix: '72DT', localisation: 'Lac 1, Tunis', duree: '1hr 30mins', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Photograph_of_construction_work_at_Camp_Nou_in_December_2025.jpg/1920px-Photograph_of_construction_work_at_Camp_Nou_in_December_2025.jpg?width=200', booking_service_id: 1 },
    { id: 2, nom: 'Santiago Bernabeu', prix: '84DT', localisation: 'Menzah 1, Tunis', duree: '1hr 30mins', img: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Estadio_Santiago_Bernab%C3%A9u_Madrid.jpg?width=200', booking_service_id: 2 },
    { id: 3, nom: 'Wembley Stadium', prix: '108DT', localisation: 'Ariana, Tunis', duree: '1hr 30mins', img: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/London_Wembley.jpg?width=200', booking_service_id: 3 },
    { id: 4, nom: 'Old Trafford', prix: '72DT', localisation: 'La Marsa, Tunis', duree: '1hr 30mins', img: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Manchester_United_Old_Trafford.jpg?width=200', booking_service_id: 4 },
    { id: 5, nom: 'Allianz Arena', prix: '84DT', localisation: 'Carthage, Tunis', duree: '1hr 30mins', img: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Allianz-Arena-M%C3%BCnchen.jpg?width=200', booking_service_id: 5 },
    { id: 6, nom: 'San Siro', prix: '108DT', localisation: 'El Mourouj, Tunis', duree: '1hr 30mins', img: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Stadio_Meazza_2021_3.jpg?width=200', booking_service_id: 6 },
    { id: 7, nom: 'Parc des Princes', prix: '72DT', localisation: 'Ezzahra, Tunis', duree: '1hr 30mins', img: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Paris_Parc_des_Princes_1.jpg?width=200', booking_service_id: 7 },
    { id: 8, nom: 'Signal Iduna Park', prix: '84DT', localisation: 'Le Bardo, Tunis', duree: '1hr 30mins', img: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Signal_iduna_park_stadium_dortmund_4.jpg?width=200', booking_service_id: 8 },
    { id: 9, nom: 'Maracana', prix: '108DT', localisation: 'Ben Arous, Tunis', duree: '1hr 30mins', img: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Maracana_2022.jpg?width=200', booking_service_id: 9 },
    { id: 10, nom: 'Anfield', prix: '72DT', localisation: 'La Soukra, Tunis', duree: '1hr 30mins', img: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Anfield_stadium_in_May_2024.jpg?width=200', booking_service_id: 10 },
    { id: 11, nom: 'Etihad Stadium', prix: '84DT', localisation: 'Charguia, Tunis', duree: '1hr 30mins', img: 'https://upload.wikimedia.org/wikipedia/commons/2/27/City_of_Manchester_Stadium_2023_cropped.jpg?width=200', booking_service_id: 11 },
    { id: 12, nom: 'Tottenham Hotspur Stadium', prix: '108DT', localisation: 'Sidi Bou Said, Tunis', duree: '1hr 30mins', img: 'https://upload.wikimedia.org/wikipedia/commons/b/be/London_Tottenham_Hotspur_Stadium.jpg?width=200', booking_service_id: 12 },
    { id: 13, nom: 'Juventus Stadium', prix: '72DT', localisation: 'Radès, Tunis', duree: '1hr 30mins', img: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Juventus_v_Real_Madrid%2C_Champions_League%2C_Stadium%2C_Turin%2C_2013.jpg?width=200', booking_service_id: 13 },
    { id: 14, nom: 'Emirates Stadium', prix: '84DT', localisation: 'Aouina, Tunis', duree: '1hr 30mins', img: 'https://upload.wikimedia.org/wikipedia/commons/2/29/London_Emirates_Stadium_arsenal.jpg?width=200', booking_service_id: 14 },
    { id: 15, nom: 'Stade de France', prix: '108DT', localisation: 'Centre Ville, Tunis', duree: '1hr 30mins', img: 'https://upload.wikimedia.org/wikipedia/commons/5/53/StadeFranceNationsLeague2018.jpg?width=200', booking_service_id: 15 }
  ]

  for (const stade of stades) {
    await prisma.stade.upsert({
      where: { id: stade.id },
      update: stade,
      create: stade,
    })
  }

  console.log('Seeding complete! ⚽')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
