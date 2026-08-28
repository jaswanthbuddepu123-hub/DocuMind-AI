const { registerSchema, loginSchema } = require('../schemas/authSchemas');
const authService = require('../services/auth/authService');
const supabase = require('../services/supabase/supabaseClient');

const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password } = validatedData;

    // Check email uniqueness
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.error('Supabase error during email check:', checkError);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const passwordHash = await authService.hashPassword(password);

    // Insert user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ name, email, password_hash: passwordHash }])
      .select('id, name, email')
      .single();

    if (insertError) {
      console.error('Supabase error during user insert:', insertError);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const token = authService.generateToken(newUser.id);

    return res.status(201).json({ token, user: newUser });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error in register:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, password_hash')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) {
      console.error('Supabase error during user fetch:', fetchError);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await authService.comparePassword(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = authService.generateToken(user.id);
    const { password_hash, ...userWithoutPassword } = user;

    return res.status(200).json({ token, user: userWithoutPassword });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error in login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const me = async (req, res) => {
  try {
    const { userId } = req.user;

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Supabase error fetching me:', fetchError);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error in me:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  me
};
