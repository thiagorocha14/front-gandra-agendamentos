<script setup lang="ts">
import { reactive, ref } from 'vue'
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
  'request-login': []
}>()

const session = useUserSession()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
})

const submitting = ref(false)
const errorMessage = ref('')

function resetForm() {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.password = ''
  errorMessage.value = ''
  submitting.value = false
}

function onHide() {
  resetForm()
}

function goToLogin() {
  visible.value = false
  emit('request-login')
}

async function submit() {
  errorMessage.value = ''
  const name = form.name.trim()
  const email = form.email.trim()
  const password = form.password
  if (!name || !email || !password) {
    errorMessage.value = 'Preencha nome, e-mail e senha.'
    return
  }
  if (password.length < 6) {
    errorMessage.value = 'A senha deve ter pelo menos 6 caracteres.'
    return
  }
  submitting.value = true
  try {
    const phoneTrim = form.phone.trim()
    const res = await AuthService.signUp({
      name,
      email,
      password,
      ...(phoneTrim ? { phone: phoneTrim } : {}),
    })
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
    header="Criar conta"
    class="cadastro-dialog"
    :style="{ width: 'min(26rem, 94vw)' }"
    :draggable="false"
    @hide="onHide"
  >
    <p class="cadastro-dialog__hint">Preencha os dados para se cadastrar na escola.</p>
    <div class="cadastro-dialog__body">
      <Message v-if="errorMessage" severity="error" :closable="false" class="cadastro-dialog__msg">
        {{ errorMessage }}
      </Message>
      <FloatLabel class="cadastro-dialog__field">
        <InputText
          id="cadastro-dialog-nome"
          v-model="form.name"
          class="w-full"
          fluid
          maxlength="100"
          autocomplete="name"
        />
        <label for="cadastro-dialog-nome">Nome</label>
      </FloatLabel>
      <FloatLabel class="cadastro-dialog__field">
        <InputText
          id="cadastro-dialog-email"
          v-model="form.email"
          class="w-full"
          fluid
          type="email"
          maxlength="100"
          autocomplete="email"
        />
        <label for="cadastro-dialog-email">E-mail</label>
      </FloatLabel>
      <FloatLabel class="cadastro-dialog__field">
        <InputText
          id="cadastro-dialog-telefone"
          v-model="form.phone"
          class="w-full"
          fluid
          maxlength="30"
          autocomplete="tel"
        />
        <label for="cadastro-dialog-telefone">Telefone (opcional)</label>
      </FloatLabel>
      <FloatLabel class="cadastro-dialog__field cadastro-dialog__field--password">
        <Password
          id="cadastro-dialog-senha"
          v-model="form.password"
          class="w-full"
          input-class="w-full"
          fluid
          :feedback="false"
          toggle-mask
          maxlength="100"
          autocomplete="new-password"
          @keyup.enter="submit"
        />
        <label for="cadastro-dialog-senha">Senha</label>
      </FloatLabel>
      <p class="cadastro-dialog__footer-text">
        Já tem uma conta?
        <button type="button" class="cadastro-dialog__link" @click="goToLogin">Entrar</button>
      </p>
    </div>
    <template #footer>
      <Button label="Cancelar" severity="secondary" text :disabled="submitting" @click="visible = false" />
      <Button type="button" label="Cadastrar" icon="pi pi-user-plus" :loading="submitting" @click="submit" />
    </template>
  </Dialog>
</template>

<style scoped>
.cadastro-dialog__hint {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  color: var(--p-surface-600);
  line-height: 1.45;
}

.cadastro-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cadastro-dialog__field {
  width: 100%;
}

.cadastro-dialog__field--password :deep(.p-password) {
  width: 100%;
}

.cadastro-dialog__msg {
  width: 100%;
}

.cadastro-dialog__footer-text {
  margin: 0;
  font-size: 0.88rem;
  color: var(--p-surface-600);
  text-align: center;
  line-height: 1.45;
}

.cadastro-dialog__link {
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

.cadastro-dialog__link:hover {
  color: var(--p-primary-700);
}
</style>
