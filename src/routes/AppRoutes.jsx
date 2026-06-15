<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  <Route path="/dashboard" element={
    <ProtectedRoute><CustomerDashboard /></ProtectedRoute>
  } />

  <Route path="/admin" element={
    <AdminRoute><AdminDashboard /></AdminRoute>
  } />
</Routes>