
const form = document.getElementById("application-form");
const button = document.getElementById("submit-button");
const statusMessage = document.getElementById("form-status");
const inputs = Array.from(form.querySelectorAll("input"));
const defaultButtonText = button.textContent;
let isSending = false;
let sdkReady = false;

try {
  if (window.emailjs) {
    window.emailjs.init({ publicKey: 'Eq9cbOZa5rlfDwaI6' });
    sdkReady = true;
  }
} catch {
  sdkReady = false;
}

function showFieldError(input, message) {
  document.getElementById(`${input.id}-error`).textContent = message;
  if (message) {
    input.setAttribute("aria-invalid", "true");
  } else {
    input.removeAttribute("aria-invalid");
  }
}

function validateField(input) {
  const value = input.value.trim();

  if (!value) {
    return "Заполните это поле.";
  }

  if (input.name === "email") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (input.validity.typeMismatch || !emailPattern.test(value)) {
      return "Введите почту в формате anna@example.com.";
    }
  }

  if (input.name === "phone") {
    const allowedCharacters = /^\+?[0-9\s()-]+$/;
    const digitCount = value.replace(/\D/g, "").length;
    if (!allowedCharacters.test(value) || digitCount < 7 || digitCount > 15) {
      return "Введите 7–15 цифр. Допустимы + в начале, пробелы, скобки и дефисы.";
    }
  }

  return "";
}

function setStatus(message, state = "") {
  statusMessage.textContent = message;
  statusMessage.dataset.state = state;
}

inputs.forEach((input) => {
  input.addEventListener("input", () => {
    if (input.hasAttribute("aria-invalid")) {
      showFieldError(input, validateField(input));
    }
    setStatus("");
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isSending) return;

  setStatus("");
  let firstInvalidInput = null;

  inputs.forEach((input) => {
    input.value = input.value.trim();
    const error = validateField(input);
    showFieldError(input, error);
    if (error && !firstInvalidInput) firstInvalidInput = input;
  });

  if (firstInvalidInput) {
    firstInvalidInput.focus();
    return;
  }

  isSending = true;
  button.disabled = true;
  button.textContent = "Отправка…";
  form.setAttribute("aria-busy", "true");
  // Поля остаются в sendForm, но не меняются во время запроса.
  inputs.forEach((input) => { input.readOnly = true; });

  try {
    if (!sdkReady) throw new Error("EmailJS SDK недоступен");

    const response = await window.emailjs.sendForm('service_pzsx6jr', 'template_wr96pem', form);
    if (response.status !== 200) throw new Error("Отправка не подтверждена");

    form.reset();
    inputs.forEach((input) => showFieldError(input, ""));
    setStatus("Заявка успешно отправлена!", "success");
  } catch {
    setStatus("Не удалось отправить заявку. Попробуйте ещё раз", "error");
  } finally {
    isSending = false;
    button.disabled = false;
    button.textContent = defaultButtonText;
    form.removeAttribute("aria-busy");
    inputs.forEach((input) => { input.readOnly = false; });
  }
});
