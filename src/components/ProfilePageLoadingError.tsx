
export function ProfilePageLoading() {
  return (
    <>
      <main id="main-content">
        <section>
          <div className="container mx-auto max-w-6xl p-4">
            <p>Loading…</p>
          </div>
        </section>
      </main>
    </>
  )
}

export function ProfilePageError() {
  return (
    <>
      <main id="main-content">
        <section>
          <div className="container mx-auto max-w-6xl p-4">
            <p>Failed to load profile.</p>
          </div>
        </section>
      </main>
    </>
  )
}
