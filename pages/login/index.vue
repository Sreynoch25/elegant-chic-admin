<template>
  <div class="login-container">
    <div class="form-container">
      <a-card class="form-card">
        <h2 class="form-title font-bold text-4xl">Welcome Admin</h2>

        <a-form @submit="login" layout="vertical">
          <a-form-item name="email" label="Email">
            <a-input v-model:value="email" type="email" placeholder="Enter your email" autocomplete="email" />
          </a-form-item>

          <a-form-item name="password" label="Password">
            <a-input v-model:value="password" type="password" placeholder="Enter your password"
              autocomplete="current-password" />
          </a-form-item>

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
            <a-button html-type="submit" block class="!font-bold custom-dark-btn" :loading="isLoading"
              :disabled="isLoading">
              {{ isLoading ? 'Logging in...' : 'Log In' }}
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <!-- Custom Snackbar/Toast -->
    <div v-if="snackbar.show" :class="['snackbar', `snackbar-${snackbar.type}`]">
      <div class="snackbar-content">
        <span class="snackbar-icon">
          <span v-if="snackbar.type === 'success'">✓</span>
          <span v-else-if="snackbar.type === 'error'">✕</span>
          <span v-else-if="snackbar.type === 'loading'" class="loading-spinner"></span>
          <span v-else>ℹ</span>
        </span>
        <span class="snackbar-message">{{ snackbar.message }}</span>
        <button @click="closeSnackbar" class="snackbar-close">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLoginStore } from '~/stores/login/auth';
import { useRouter } from 'vue-router';

definePageMeta({
  layout: 'login',
})

const loginStore = useLoginStore();
const router = useRouter();

const isLoading = ref(false);
const errors = ref<Partial<Error>>({});

// Bind login form inputs
const email = ref('');
const password = ref('');

// Snackbar state
const snackbar = ref({
  show: false,
  message: '',
  type: 'info' as 'success' | 'error' | 'info' | 'loading'
});

let snackbarTimeout: NodeJS.Timeout | null = null;

// Watch and sync with store.user
watchEffect(() => {
  console.log('Form values updated - Email:', email.value, 'Password:', password.value ? '***' : 'empty');
  loginStore.user.email = email.value;
  loginStore.user.password = password.value;
});

// Snackbar methods
const showSnackbar = (message: string, type: 'success' | 'error' | 'info' | 'loading' = 'info', duration: number = 4000) => {

  // Clear existing timeout
  if (snackbarTimeout) {
    clearTimeout(snackbarTimeout);
  }

  snackbar.value = {
    show: true,
    message,
    type
  };

  // Auto-close snackbar (except for loading type)
  if (type !== 'loading' && duration > 0) {
    snackbarTimeout = setTimeout(() => {
      closeSnackbar();
    }, duration);
  }
};

const closeSnackbar = () => {
  snackbar.value.show = false;
  if (snackbarTimeout) {
    clearTimeout(snackbarTimeout);
    snackbarTimeout = null;
  }
};

// Add email validation
const validateForm = () => {
  console.log('Validating form...');
  // Email validation
  if (!email.value.trim()) {
    console.log('Validation failed: Email is required');
    showSnackbar("Email is required", 'error');
    return false;
  }
  
  // Simple email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    console.log('Validation failed: Invalid email format', email.value);
    showSnackbar("Please enter a valid email address", 'error');
    return false;
  }
  
  // Password validation
  if (!password.value.trim()) {
    console.log('Validation failed: Password is required');
    showSnackbar("Password is required", 'error');
    return false;
  }
  
  console.log('Form validation passed');
  return true;
};

const login = async (e: Event) => {
  e.preventDefault();
  console.log('Login form submitted');

  if (!validateForm()) {
    console.log('Login aborted: Form validation failed');
    return;
  }

  isLoading.value = true;
  closeSnackbar();

  // Debug: Check what's being sent to the store
  console.log('Login attempt with credentials:', {
    email: email.value,
    password: password.value,
    storeEmail: loginStore.user.email,
    storePassword: loginStore.user.password
  });

  // Show loading snackbar
  showSnackbar("Logging in...", 'loading', 0);

  try {
    console.log('Calling loginStore.fetchLogin()...');
    const response = await loginStore.fetchLogin();
    console.log('Login response received:', response);

    if (response && response.data) {
      console.log('Login successful:', response.data);
      // Success case
      closeSnackbar();
      showSnackbar("Login successful! Redirecting...", 'success', 3000);

      // Optional: Redirect after success message
      setTimeout(() => {
        console.log('Redirecting to home page...');
        router.push('/');
      }, 1500);

    } else {
      // Failed response
      console.log('Login failed: No valid response data', response);
      closeSnackbar();
      showSnackbar("Invalid email or password. Please try again.", 'error');
    }

  } catch (error: any) {
    console.error('Login error caught:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      status: error.status,
      statusCode: error.statusCode,
      data: error.data
    });
    
    closeSnackbar();

    // Show specific error message based on error type
    let errorMessage = "Email or password wrong";
    
    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.data?.message) {
      errorMessage = error.data.message;
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    showSnackbar(errorMessage, 'error', 4000);

  } finally {
    console.log('Login process completed, setting isLoading to false');
    isLoading.value = false;
  }
};

// Clear snackbar when component unmounts
onUnmounted(() => {
  console.log('Login component unmounted');
  if (snackbarTimeout) {
    clearTimeout(snackbarTimeout);
  }
});

// Log component initialization
console.log('Login component initialized');
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

/* Snackbar Styles */
.snackbar {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  min-width: 300px;
  max-width: 500px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  animation: slideInRight 0.3s ease-out;
}

.snackbar-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  font-weight: 500;
}

.snackbar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 16px;
  font-weight: bold;
}

.snackbar-message {
  flex: 1;
  font-size: 14px;
}

.snackbar-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.snackbar-close:hover {
  opacity: 1;
}

.snackbar-success {
  background-color: rgba(34, 197, 94, 0.9);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #ffffff;
}

.snackbar-error {
  background-color: rgba(239, 68, 68, 0.9);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ffffff;
}

.snackbar-info {
  background-color: rgba(59, 130, 246, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #ffffff;
}

.snackbar-loading {
  background-color: rgba(59, 130, 246, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #ffffff;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
  transition: all 0.3s ease;
}

.custom-dark-btn:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 1) !important;
  transform: translateY(-1px);
}

.custom-dark-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

/* Mobile responsiveness for snackbar */
@media (max-width: 640px) {
  .snackbar {
    top: 10px;
    right: 10px;
    left: 10px;
    min-width: auto;
    max-width: none;
  }
}
</style>