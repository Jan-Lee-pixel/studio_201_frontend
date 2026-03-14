import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zeiavqgfvagqzafgzizl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplaWF2cWdmdmFncXphZmd6aXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0OTI1NTIsImV4cCI6MjA4NzA2ODU1Mn0.kh8-sk1VerLQDB5_2XBgNvRdm6wzm_6r_y8VcBgP-es'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testSignup() {
  const email = `testuser_${Date.now()}@gmail.com`
  const password = 'testpassword123'
  
  console.log(`Signing up ${email}...`)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Signup error:', error.message)
    return
  }

  console.log('Signup successful. Access Token:')
  console.log(data.session?.access_token)
}

testSignup()
