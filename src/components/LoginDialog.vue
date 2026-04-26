<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import { useUserSession } from '@/composables/useUserSession'
import { AuthService } from '@/services/AuthService'
import { getApiErrorMessage } from '@/utils/apiError'

const visible = defineModel<boolean>('visible', { default: false })

const emit = defineEmits<{
  'request-register': []
}>()

const session = useUserSession()

const email = ref('')
const password = ref('')
const submitting = ref(false)
const errorMessage = ref('')

function resetForm() {
  email.value = ''
  password.value = ''
  errorMessage.value = ''
  submitting.value = false
}

function onHide() {
  resetForm()
}

function goToRegister() {
  visible.value = false
  emit('request-register')
}

async function submit() {
  errorMessage.value = ''
  const e = email.value.trim()
  const p = password.value
  if (!e || !p) {
    errorMessage.value = 'Informe e-mail e senha.'
    return
  }
  submitting.value = true
  try {
    const res = await AuthService.signIn({ email: e, password: p })
    session.setFromAuthResponse(res)
    visible.value = false
  } catch (err) {
    errorMessage.value = getApiErrorMessage(err)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Entrar"
    class="login-dialog"
    :style="{ width: 'min(24rem, 94vw)' }"
    :draggable="false"
    @hide="onHide"
  >
    <p class="login-dialog__hint">Entre com o e-mail e a senha da sua conta.</p>
    <div class="login-dialog__body">
      <Message v-if="errorMessage" severity="error" :closable="false" class="login-dialog__msg">
        {{ errorMessage }}
      </Message>
      <FloatLabel class="login-dialog__field">
        <InputText
          id="login-dialog-email"
          v-model="email"
          class="w-full"
          fluid
          type="email"
          maxlength="100"
          autocomplete="email"
          @keyup.enter="submit"
        />
        <label for="login-dialog-email">E-mail</label>
      </FloatLabel>
      <FloatLabel class="login-dialog__field login-dialog__field--password">
        <Password
          id="login-dialog-senha"
          v-model="password"
          class="w-full"
          input-class="w-full"
          fluid
          :feedback="false"
          toggle-mask
          maxlength="255"
          autocomplete="current-password"
          @keyup.enter="submit"
        />
        <label for="login-dialog-senha">Senha</label>
      </FloatLabel>
      <p class="login-dialog__footer-text">
        Não tem uma conta?
        <button type="button" class="login-dialog__link" @click="goToRegister">Cadastre-se aqui</button>
      </p>
    </div>
    <template #footer>
      <Button label="Cancelar" severity="secondary" text :disabled="submitting" @click="visible = false" />
      <Button label="Entrar" icon="pi pi-check" :loading="submitting" @click="submit" />
    </template>
  </Dialog>
</template>

<style scoped>
.login-dialog__hint {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  color: var(--p-surface-600);
  line-height: 1.45;
}

.login-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.login-dialog__field {
  width: 100%;
}

.login-dialog__field--password :deep(.p-password) {
  width: 100%;
}

.login-dialog__msg {
  width: 100%;
}

.login-dialog__footer-text {
  margin: 0;
  font-size: 0.88rem;
  color: var(--p-surface-600);
  text-align: center;
  line-height: 1.45;
}

.login-dialog__link {
  display: inline;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  font: inherit;
  color: var(--p-primary-600);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.login-dialog__link:hover {
  color: var(--p-primary-700);
}
</style>
