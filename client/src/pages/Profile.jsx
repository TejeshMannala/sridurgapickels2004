import { useAuth } from '../context/AuthContext'

function Profile() {
  const { auth } = useAuth()

  return (
    <section className="mx-auto max-w-xl px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">Profile</h2>
      <div className="card p-6 space-y-3">
        <p>
          <span className="font-semibold">Name:</span> {auth?.name}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {auth?.email}
        </p>
        <p>
          <span className="font-semibold">Role:</span> {auth?.role}
        </p>
      </div>
    </section>
  )
}

export default Profile
