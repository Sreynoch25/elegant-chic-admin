<template>
  <div class="login-container">
    <div class="form-container">
      <a-card class="form-card">
        <h2 class="form-title font-bold text-4xl">Welcome Admin</h2>

        <a-form @submit="login" layout="vertical">
          <a-form-item name="username" label="Username">
            <a-input v-model:value="username" placeholder="Enter your username" autocomplete="username" />
          </a-form-item>

          <a-form-item name="password" label="Password">
            <a-input v-model:value="password" type="password" placeholder="Enter your password"
              autocomplete="current-password" />
          </a-form-item>

          <div v-if="errorMessage" style="color: red; margin-bottom: 16px;">
            {{ errorMessage }}
          </div>

          <a-form-item>
            <a-row justify="space-between" align="middle">
              <a-col>
                <a-checkbox class="custom-checkbox">
                  <span class="checkbox-label">Remember me</span>
                </a-checkbox>
              </a-col>
              <a-col>
                <a href="#" class="forgot-link">Forgot password?</a>
              </a-col>
            </a-row>
          </a-form-item>

          <a-form-item>
            <a-button html-type="submit" block class="!font-bold custom-dark-btn">
              Log In
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLoginStore } from '~/stores/login/loginStore';

definePageMeta({
  layout: 'login',
})

const loginStore = useLoginStore();

const errorMessage = ref('');
const snackbar = ref(false);
const messageInvalid = ref('');
const errors = ref<Partial<Error>>({});

// Bind login form inputs
const username = ref('');
const password = ref('');

// Watch and sync with store.user
watchEffect(() => {
  loginStore.user.email = username.value; // if login by email
  loginStore.user.password = password.value;
});

const login = async (e: Event) => {
  e.preventDefault();

  errors.value = {};
  errorMessage.value = '';
  snackbar.value = false;

  try {
    if (!loginStore.user.email || !loginStore.user.password) {
      if (!loginStore.user.email) {
        errors.value.message = "Username is required";
      }
      if (!loginStore.user.password) {
        errors.value.message = "Password is required";
      }
      snackbar.value = true;
      return;
    }
    const response = await loginStore.fetchLogin();
    if (response && response.data) {
    } else {
      messageInvalid.value = "Login failed. Please try again.";
      snackbar.value = true;
    }
  } catch (error: any) {
    if (error?.errors) {
      errors.value = error.errors;
    } else if (error?.error) {
      messageInvalid.value = error.error;
    } else {
      messageInvalid.value = "An unexpected error occurred.";
    }
    snackbar.value = true;
  }
};
</script>


<style scoped lang="css">
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-image: url('/banners/background-store.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  z-index: 0;
}

.login-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: -1;
}

.form-container {
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(8px);
}

.form-card {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  padding: 32px;
  color: #fff;
}

.form-title {
  text-align: center;
  margin-bottom: 24px;
  color: #ffffff;
}

.forgot-link {
  color: #ffffff;
  text-decoration: none;
  font-size: 0.875rem;
}

.forgot-link:hover {
  text-decoration: underline;
}

.ant-input,
.ant-input-password {
  background-color: rgba(0, 0, 0, 0.2) !important;
  color: #fff !important;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.ant-input::placeholder,
.ant-input-password input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

:deep(.ant-checkbox-wrapper) {
  color: rgba(255, 255, 255, 0.7);
}

.custom-dark-btn {
  background-color: rgba(0, 0, 0, 0.8) !important;
  border-color: transparent !important;
  color: #fff !important;
}

.custom-dark-btn:hover {
  background-color: rgba(0, 0, 0, 1) !important;
}

.checkbox-label {
  font-weight: 600;
}

:deep(.custom-checkbox .ant-checkbox-checked .ant-checkbox-inner) {
  background-color: #000 !important;
  border-color: #000 !important;
}

:deep(.custom-checkbox .ant-checkbox-inner) {
  border-radius: 4px;
}
</style>