import { useState } from 'react';
import {
  Container,
  TextField,
  Typography,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');         // ✅ 별명 필드 추가
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [nicknameError, setNicknameError] = useState(''); // ✅ 별명 오류 상태
  const [checkingNickname, setCheckingNickname] = useState(false); // ✅ 로딩 상태
  const navigate = useNavigate();

  // ✅ 닉네임 중복 확인
  const handleCheckNickname = async () => {
    if (!nickname.trim()) return;
    setNicknameError('');
    setCheckingNickname(true);

    try {
      const res = await axios.get(
        `http://localhost:8000/users/check-nickname?nickname=${nickname}`
      );
      if (res.data.exists) {
        setNicknameError('이미 사용 중인 별명입니다.');
      }
    } catch (err) {
      setNicknameError('별명 확인 중 오류가 발생했습니다.');
    } finally {
      setCheckingNickname(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (nicknameError) {
      alert('별명 중복을 확인해주세요.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:8000/users', {
        username,
        nickname,                  // ✅ 백엔드에 별명 포함
        email,
        password,
        password_confirm: password, // ✅ 백엔드 유효성 검사 통과용
        birth_date: birthdate,      // ✅ 백엔드 스키마에 맞춤
      });

      alert('회원가입 완료!');
      navigate('/login');
    } catch (err: any) {
      console.error('❌ 회원가입 에러 응답:', err.response?.data);

      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((e: any) => e.msg).join(', ')
        : detail || '회원가입에 실패했습니다.';

      alert(`회원가입 실패: ${message}`);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        회원가입
      </Typography>

      <Box component="form" onSubmit={handleSignup}>
        <TextField
          fullWidth
          label="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="별명"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            setNicknameError('');
          }}
          onBlur={handleCheckNickname}       // ✅ 입력 후 포커스 해제 시 중복 확인
          error={!!nicknameError}
          helperText={nicknameError}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="이메일"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="비밀번호 확인"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="생년월일"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          sx={{ mb: 4 }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={checkingNickname}   // ✅ 중복 확인 중이면 비활성화
        >
          {checkingNickname ? <CircularProgress size={24} color="inherit" /> : '회원가입 완료'}
        </Button>
      </Box>
    </Container>
  );
};

export default SignupPage;