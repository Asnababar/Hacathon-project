const form = document.getElementById('resume-form') as HTMLFormElement;
const resumeOutput = document.getElementById('resume-output') as HTMLDivElement;
const shareLinkDiv = document.getElementById('share-link') as HTMLDivElement;
const resumeURLInput = document.getElementById('resume-url') as HTMLInputElement;
const copyLinkButton = document.getElementById('copy-link') as HTMLButtonElement;
const downloadResumeButton = document.getElementById('download-resume') as HTMLButtonElement;
const profilePicInput = document.getElementById('profile-pic') as HTMLInputElement;

const generateUniqueURL = (): string => {
  return `${window.location.origin}/resume/${Date.now()}`;
};

function generateEditableSection(title: string, content: string): string {
  return `
    <div class="editable-section">
      <h2>${title}</h2>
      <p class="editable-content" contenteditable="false">${content}</p>
      <div class="button-group">
        <button class="edit-button">Edit</button>
        <button class="save-button hidden">Save</button>
      </div>
    </div>
  `;
}

function generateEditableListSection(title: string, items: string[]): string {
  const listItems = items.map(item => `<li>${item.trim()}</li>`).join('');
  return `
    <div class="editable-section">
      <h2>${title}</h2>
      <ul class="editable-content" contenteditable="false">
        ${listItems}
      </ul>
      <div class="button-group">
        <button class="edit-button">Edit</button>
        <button class="save-button hidden">Save</button>
      </div>
    </div>
  `;
}

function generatePersonalInfoSectionWithEdit(name: string, email: string, phone: string, profilePicSrc?: string): string {
  let imgHtml = '';
  if (profilePicSrc) {
    imgHtml = `
      <img src="${profilePicSrc}" alt="Profile Picture" id="profile-pic-output" />
      <div class="button-group">
        <button class="edit-profile-pic-button">Edit Picture</button>
      </div>
    `;
  }

  return `
    <div class="editable-section" id="personal-info-section">
      <h2>Personal Information</h2>
      ${imgHtml}
      <p class="editable-content" contenteditable="false"><strong>Name:</strong> ${name}</p>
      <p class="editable-content" contenteditable="false"><strong>Email:</strong> ${email}</p>
      <p class="editable-content" contenteditable="false"><strong>Phone:</strong> ${phone}</p>
      <div class="button-group">
        <button class="edit-button">Edit</button>
        <button class="save-button hidden">Save</button>
      </div>
    </div>
  `;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = (document.getElementById('name') as HTMLInputElement).value;
  const email = (document.getElementById('email') as HTMLInputElement).value;
  const phone = (document.getElementById('phone') as HTMLInputElement).value;
  const education = (document.getElementById('education') as HTMLTextAreaElement).value;
  const workExperience = (document.getElementById('work-experience') as HTMLTextAreaElement).value;
  const skills = (document.getElementById('skills') as HTMLTextAreaElement).value.split('\n').filter(skill => skill.trim() !== '');
  const profilePicFile = profilePicInput.files?.[0];

  const handleProfilePic = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result as string);
      };
      reader.onerror = function () {
        reject('Error reading profile picture.');
      };
      reader.readAsDataURL(file);
    });
  };

  const populateResume = (profilePicSrc?: string) => {
    resumeOutput.innerHTML = `
      ${generatePersonalInfoSectionWithEdit(name, email, phone, profilePicSrc)}
      ${generateEditableSection('Education', education)}
      ${generateEditableSection('Work Experience', workExperience)}
      ${generateEditableListSection('Skills', skills)}
    `;

    resumeOutput.classList.remove('hidden');
    shareLinkDiv.classList.remove('hidden');

    const resumeURL = generateUniqueURL();
    resumeURLInput.value = resumeURL;
  };

  if (profilePicFile) {
    try {
      const profilePicSrc = await handleProfilePic(profilePicFile);
      populateResume(profilePicSrc);
    } catch (error) {
      console.error(error);
      populateResume();
    }
  } else {
    populateResume();
  }
});

function toggleEditSave(button: HTMLButtonElement, saveButton: HTMLButtonElement, contentElement: HTMLElement) {
  if (button.textContent === 'Edit') {
    contentElement.setAttribute('contenteditable', 'true');
    contentElement.focus();
    button.classList.add('hidden');
    saveButton.classList.remove('hidden');
  }
}

function saveContent(button: HTMLButtonElement, editButton: HTMLButtonElement, contentElement: HTMLElement) {
  if (button.textContent === 'Save') {
    contentElement.setAttribute('contenteditable', 'false');
    button.classList.add('hidden');
    editButton.classList.remove('hidden');
  }
}

function downloadResumeAsPDF() {
  const resumeHtml = resumeOutput.innerHTML;

  // Create a new window with the resume content
  const pdfWindow = window.open('', '', 'width=800,height=600');
  pdfWindow!.document.write('<html><head><title>Resume</title></head><body>');
  pdfWindow!.document.write(resumeHtml);
  pdfWindow!.document.write('</body></html>');
  pdfWindow!.document.close();

  // Use the browser's print dialog to save as PDF
  pdfWindow!.print();
}

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;

  if (target.classList.contains('edit-button')) {
    const button = target as HTMLButtonElement;
    const parentSection = button.closest('.editable-section');
    if (parentSection) {
      const saveButton = parentSection.querySelector('.save-button') as HTMLButtonElement;
      const contentElement = parentSection.querySelector('.editable-content') as HTMLElement;
      if (saveButton && contentElement) {
        toggleEditSave(button, saveButton, contentElement);
      }
    }
  }

  if (target.classList.contains('save-button')) {
    const button = target as HTMLButtonElement;
    const parentSection = button.closest('.editable-section');
    if (parentSection) {
      const editButton = parentSection.querySelector('.edit-button') as HTMLButtonElement;
      const contentElement = parentSection.querySelector('.editable-content') as HTMLElement;
      if (editButton && contentElement) {
        saveContent(button, editButton, contentElement);
      }
    }
  }

  if (target.classList.contains('edit-profile-pic-button')) {
    const button = target as HTMLButtonElement;
    const parentSection = button.closest('.editable-section');
    if (parentSection) {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.onchange = (e: Event) => {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
          const file = input.files[0];
          const reader = new FileReader();
          reader.onload = function () {
            const imgElement = parentSection.querySelector('#profile-pic-output') as HTMLImageElement;
            if (imgElement) {
              imgElement.src = reader.result as string;
            }
          };
          reader.readAsDataURL(file);
        }
      };
      fileInput.click();
    }
  }

  if (target.id === 'copy-link') {
    resumeURLInput.select();
    document.execCommand('copy');
    alert('Resume link copied to clipboard!');
  }

  if (target.id === 'download-resume') {
    downloadResumeAsPDF();
  }
});