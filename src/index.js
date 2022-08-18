import './css/styles.css';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const form = document.querySelector('#search-form');
const input = document.querySelector('input');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const BASE_URL = 'https://pixabay.com/api/';
const MY_KEY = '29245292-844c4c201188366cd8cc26438';
const lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  captionsData: 'alt',
  captionPosition: 'bottom',
});

let nameSearch = input.value;
let currentPage = 0;
let perPage = 40;
const totalPages = 500 / perPage;

form.addEventListener('submit', onFormSubmit);
loadMoreBtn.addEventListener('click', onLoadMore);
loadMoreBtn.classList.add('is-hidden');

function onFormSubmit(e) {
  e.preventDefault();
  gallery.innerHTML = '';
  nameSearch = input.value.trim();

  onGetImages()
    .then(images => {
      currentPage += 1;
      // loadMoreBtn.classList.remove('is-hidden');
    })
    .catch(error => {
      Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
      console.log(error.message);
    });
}
async function onGetImages() {
  try {
    const responce = await axios.get(
      `${BASE_URL}?key=${MY_KEY}&q=${nameSearch}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${currentPage}`
    );
    const gottenImages = responce.data.hits;
    const totalHits = responce.totalHits;
    if (gottenImages.length === 0) {
      return Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else if (gottenImages.length < 500 && totalHits > 0) {
      loadMoreBtn.classList.remove('is-hidden');
      Notify.success(`Hooray! We found ${totalHits} images.`);
    }
    galleryMarkup(gottenImages);
  } catch (error) {
    console.log(error);
  }
}

function galleryMarkup(data) {
  // const image = data.hits;

  const markup = data
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card"><a class="image-link" href="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
  <div class="info">
    <p class="info-item">
      <b>Likes: </b> <span class="number-of">${likes}</span>
    </p>
    <p class="info-item">
      <b>Views: </b> <span class="number-of">${views}</span>
    </p>
    <p class="info-item">
      <b>Comments: </b> <span class="number-of">${comments}</span>
    </p>
    <p class="info-item">
      <b>Downloads: </b> <span class="number-of">${downloads}</span>
    </p>
  </div>
  </a>
</div>`;
      }
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

// function onModalOpenClick(el) {
//   const imgTarget = el.target.classList.contains('gallery__image');
//   if (!imgTarget) {
//     return;
//   }

//   el.preventDefault();
// }

function onLoadMore() {
  if (currentPage > totalPages) {
    loadMoreBtn.classList.add('is-hidden');
    onGetImages();
  }
}
