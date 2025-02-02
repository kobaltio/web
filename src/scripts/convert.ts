const convertBtn = document.getElementById('convertBtn') as HTMLButtonElement;

const urlElement = document.getElementById('url') as HTMLInputElement;
const titleElement = document.getElementById('title') as HTMLInputElement;
const artistElement = document.getElementById('artist') as HTMLInputElement;

const progressBar = document.getElementById('progressBar')!;
const progressContainer = document.getElementById('progressContainer')!;
const statusElement = document.getElementById('status')!;

const successElement = document.getElementById('success')!;
const errorElement = document.getElementById('error')!;
const errorText = document.getElementById('errorText')!;

convertBtn.addEventListener('click', () => {
  errorElement.classList.add('hidden');
  successElement.classList.add('hidden');

  const url = urlElement.value.trim();
  const title = titleElement.value.trim();
  const artist = artistElement.value.trim();

  if (url.length === 0 || title.length === 0 || artist.length === 0) {
    showError('All fields are required');
    return;
  }

  if (!isValidUrl(url)) {
    showError('Invalid YouTube URL');
    return;
  }

  convertBtn.disabled = true;
  convertBtn.innerText = '. . .';
  progressContainer.classList.remove('hidden');

  const queryParams = new URLSearchParams({ url, title, artist });
  const eventSource = new EventSource(
    'http://localhost:8080/convert?' + queryParams.toString(),
  );

  const reset = () => {
    eventSource.close();
    convertBtn.disabled = false;
    convertBtn.innerText = 'Convert';
    statusElement.innerText = '';
    progressContainer.classList.add('hidden');
  };

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.status === 'error') {
      showError(`Error: ${data.message}`);
      reset();
      return;
    }

    if (!data.message) {
      showError('Failed to process server message');
      reset();
      return;
    }

    statusElement.innerText = data.message;

    if (data.progress) {
      progressBar.style.width = `${data.progress}%`;
    }

    if (data.status === 'completed') {
      errorElement.classList.add('hidden');
      successElement.classList.remove('hidden');
      reset();
    }
  };

  eventSource.onerror = () => {
    showError('Connection lost. Please try again.');
    reset();
    return;
  };
});

const showError = (message: string) => {
  errorText.innerText = message;
  errorElement.classList.remove('hidden');
};

const isValidUrl = (url: string) => {
  const regExp =
    /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  if (url.match(regExp)) {
    return true;
  }
  return false;
};
