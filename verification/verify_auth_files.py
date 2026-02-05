from playwright.sync_api import sync_playwright
import time
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        print("Navigating to Admin Panel (should redirect to login)...")
        response = page.goto("http://localhost:3000/en/admin")

        if "/en/admin/login" in page.url:
            print("Successfully redirected to login page.")
        else:
            print(f"FAILED: Did not redirect to login. Current URL: {page.url}")
            # return # Continue to debug

        print("Attempting to login...")
        # Check if inputs exist
        if page.is_visible('input[name="password"]'):
             page.fill('input[name="password"]', 'blueconcierge')
             page.click('button[type="submit"]')
             print("Clicked submit.")
        else:
            print("Password input not found!")
            page.screenshot(path="verification/login_fail.png")
            return

        try:
            page.wait_for_url("**/en/admin", timeout=5000)
            print("Logged in successfully. Reached Admin Dashboard.")
            page.screenshot(path="verification/auth_dashboard.png")
        except Exception as e:
            print(f"Login timeout/failure: {e}")
            page.screenshot(path="verification/login_timeout.png")
            # Force navigation to see if cookie was set anyway
            page.goto("http://localhost:3000/en/admin")
            if page.url.endswith("/en/admin"):
                 print("Manual navigation worked - cookie was set.")
                 page.screenshot(path="verification/auth_dashboard_forced.png")
            else:
                 print("Manual navigation failed - cookie probably not set.")

        # If we are on dashboard, check file manager
        if "/en/admin" in page.url and "login" not in page.url:
            print("Navigating to File Manager...")
            try:
                page.click('text=File Manager')
                page.wait_for_selector('h1:has-text("File Manager")', timeout=5000)
                print("Reached File Manager.")
                page.screenshot(path="verification/auth_filemanager.png")
            except Exception as e:
                print(f"File Manager nav error: {e}")

        print("Verification Complete.")
        browser.close()

if __name__ == "__main__":
    if not os.path.exists("verification"):
        os.makedirs("verification")
    run()
