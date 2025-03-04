# Realty

![Realty Logo](./realty_logo_dark.png)

## O projektu

Ovaj projekt je razvijen kao dio sveučilišnog kolegija Web aplikacije. Projekt se sastoji od frontend i backend dijela. Frontend dio projekta možete pronaći na [realty-frontend](https://github.com/petarally/realty-front).

## Funkcionalnosti

### Frontend

- **Dodavanje nekretnina**: Korisnici mogu dodavati nove nekretnine putem forme koja uključuje naziv, opće podatke, sadržaje, opis, slike i podatke o prodavatelju.
- **Prikaz pretplatnika**: Prikaz svih pretplatnika na newsletter.
- **Prikaz nekretnina**: Prikaz svih dostupnih nekretnina s detaljima.
- **Pretraga nekretnina**: Korisnici mogu pretraživati nekretnine prema različitim kriterijima.
- **Autentifikacija korisnika**: Korisnici se mogu registrirati i prijaviti kako bi koristili aplikaciju.

### Backend

- **REST API**: Backend pruža REST API za upravljanje nekretninama, korisnicima i pretplatnicima.
- **Autentifikacija i autorizacija**: Implementirana je autentifikacija i autorizacija korisnika pomoću JWT tokena.
- **Upravljanje slikama**: Backend omogućuje prijenos i pohranu slika nekretnina.
- **Baza podataka**: Podaci se pohranjuju u MongoDB bazu podataka.

## Tehnologije

### Frontend

- **Vue.js**: JavaScript framework za izgradnju korisničkog sučelja.
- **Axios**: Biblioteka za HTTP zahtjeve.
- **Tailwind CSS**: CSS framework za stiliziranje korisničkog sučelja.
- **AOS**: Animacije

### Backend

- **Node.js**: JavaScript runtime za izgradnju server-side aplikacija.
- **Express.js**: Web framework za Node.js.
- **MongoDB**: NoSQL baza podataka.
- **Multer**: Middleware za rukovanje prijenosom fotografija.

## Funkcionalnost Backenda

### Rute

#### API Endpoints

| Method   | Endpoint                   | Description                                             |
| -------- | -------------------------- | ------------------------------------------------------- |
| `POST`   | `/auth/login`              | Prijava za admine i agente                              |
| `GET`    | `/users`                   | Dohavaća sve korisnike                                  |
| `GET`    | `/users/:id`               | Dohvaća pojedinog korisnika                             |
| `PATCH`  | `/users/:id`               | Izmjena podataka o korisniku                            |
| `POST`   | `/users/createUser`        | Dodavanje novog korisnika                               |
| `GET`    | `/pretplatnici`            | Dohvaćanje svih pretplatnika                            |
| `POST`   | `/pretplatnici`            | Dodavanje novog pretplatnika                            |
| `GET`    | `/prodavatelji`            | Dohvaćanje svih prodavatelja                            |
| `GET`    | `/nekretnine`              | Dohvaćanje svih nekretnina                              |
| `POST`   | `/nekretnine`              | Dodavanje nove nekretnine                               |
| `POST`   | `/nekretnine/prodavatelji` | Dodavanje novog prodavatelja                            |
| `GET`    | `/nekretnine/search`       | Dohvaćanje rezultata pretrage prema zadanim parametrima |
| `GET`    | `/nekretnine/:id`          | Dohvaćanje pojedine nekretnine                          |
| `PATCH`  | `/nekretnine/:id`          | Izmjena podataka o nekretnini                           |
| `DELETE` | `/delete/:id`              | Brisanje nekretnine                                     |
| `POST`   | `/upload-images`           | Dodavanje slika na Cloudflare R2                        |
