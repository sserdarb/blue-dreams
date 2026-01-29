from playwright.sync_api import sync_playwright

def verify_site():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # 1. Visit Home Page (EN)
        print("Navigating to Home Page...")
        page.goto("http://localhost:3000/en")
        try:
            page.wait_for_selector("text=Every Dream Starts with Blue", timeout=10000)
            print("Home page loaded content successfully.")
        except:
            print("Failed to find 'Every Dream Starts with Blue'.")

        page.screenshot(path="/home/jules/verification/home_en.png")
        print("Home Page Screenshot taken.")

        # 2. Visit Chat Widget (Open it)
        print("Testing Chat Widget...")
        try:
            # Click the button with MessageSquare icon (we can target by role or class)
            # The button is the only button in that fixed container
            page.wait_for_selector(".fixed.bottom-6.right-6 button", timeout=5000)
            page.locator(".fixed.bottom-6.right-6 button").click()

            # Wait for "Blue Concierge" text
            page.wait_for_selector("text=Blue Concierge", timeout=5000)
            page.screenshot(path="/home/jules/verification/chat_open.png")
            print("Chat Screenshot taken.")
        except Exception as e:
            print(f"Chat interaction failed: {e}")

        # 3. Visit Admin Panel
        print("Navigating to Admin Panel...")
        page.goto("http://localhost:3000/en/admin")
        try:
            page.wait_for_selector("text=Dashboard", timeout=5000)
            page.screenshot(path="/home/jules/verification/admin_dashboard.png")
            print("Admin Screenshot taken.")
        except Exception as e:
            print(f"Admin load failed: {e}")

        browser.close()

if __name__ == "__main__":
    verify_site()
