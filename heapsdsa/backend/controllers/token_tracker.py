import json
import time
from datetime import datetime, timedelta
from typing import Dict, Optional

class TokenTracker:
    def __init__(self, budget: int = 10000, alert_threshold: float = 0.8):
        """
        Initialize token tracker
        
        Args:
            budget: Total token budget for the session
            alert_threshold: Alert when usage reaches this percentage of budget
        """
        self.budget = budget
        self.alert_threshold = alert_threshold
        self.used_tokens = 0
        self.session_start = datetime.now()
        self.usage_history = []
        self.tracker_file = "token_usage.json"
        
        # Load existing usage if available
        self.load_usage()
    
    def load_usage(self):
        """Load existing token usage from file"""
        try:
            with open(self.tracker_file, 'r') as f:
                data = json.load(f)
                self.used_tokens = data.get('used_tokens', 0)
                self.usage_history = data.get('usage_history', [])
                print(f"📊 Loaded existing usage: {self.used_tokens} tokens")
        except FileNotFoundError:
            print("🆕 Starting new token tracking session")
        except Exception as e:
            print(f"⚠️  Error loading usage: {e}")
    
    def save_usage(self):
        """Save current token usage to file"""
        try:
            data = {
                'used_tokens': self.used_tokens,
                'budget': self.budget,
                'session_start': self.session_start.isoformat(),
                'usage_history': self.usage_history,
                'last_updated': datetime.now().isoformat()
            }
            with open(self.tracker_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"⚠️  Error saving usage: {e}")
    
    def track_request(self, tokens_used: int, url: str = "", description: str = ""):
        """
        Track tokens used in a request
        
        Args:
            tokens_used: Number of tokens consumed
            url: URL that was scraped
            description: Description of the operation
        """
        self.used_tokens += tokens_used
        
        # Record usage history
        usage_record = {
            'timestamp': datetime.now().isoformat(),
            'tokens_used': tokens_used,
            'total_used': self.used_tokens,
            'url': url,
            'description': description
        }
        self.usage_history.append(usage_record)
        
        # Keep only last 100 records to prevent file bloat
        if len(self.usage_history) > 100:
            self.usage_history = self.usage_history[-100:]
        
        # Save usage
        self.save_usage()
        
        # Check alerts
        self.check_alerts()
        
        # Print usage info
        self.print_usage_info(tokens_used, url, description)
    
    def check_alerts(self):
        """Check if usage exceeds alert thresholds"""
        usage_percentage = (self.used_tokens / self.budget) * 100
        
        if usage_percentage >= 100:
            print(f"💳 CRITICAL: Token budget exceeded! {self.used_tokens}/{self.budget}")
            raise Exception(f"Token budget exceeded! {self.used_tokens}/{self.budget} tokens used")
        elif usage_percentage >= (self.alert_threshold * 100):
            print(f"⚠️  WARNING: Token usage at {usage_percentage:.1f}% ({self.used_tokens}/{self.budget})")
        elif usage_percentage >= 50:
            print(f"📊 INFO: Token usage at {usage_percentage:.1f}% ({self.used_tokens}/{self.budget})")
        
        return True
    
    def print_usage_info(self, tokens_used: int, url: str = "", description: str = ""):
        """Print usage information for the current request"""
        usage_percentage = (self.used_tokens / self.budget) * 100
        remaining = self.budget - self.used_tokens
        
        print(f"  💰 Tokens: +{tokens_used} | Total: {self.used_tokens}/{self.budget} ({usage_percentage:.1f}%) | Remaining: {remaining}")
        
        if url:
            print(f"  🔗 URL: {url}")
        if description:
            print(f"  📝 {description}")
    
    def get_usage_stats(self) -> Dict:
        """Get current usage statistics"""
        session_duration = datetime.now() - self.session_start
        tokens_per_hour = (self.used_tokens / session_duration.total_seconds()) * 3600 if session_duration.total_seconds() > 0 else 0
        
        return {
            'used_tokens': self.used_tokens,
            'budget': self.budget,
            'remaining': self.budget - self.used_tokens,
            'usage_percentage': (self.used_tokens / self.budget) * 100,
            'session_duration': str(session_duration),
            'tokens_per_hour': tokens_per_hour,
            'estimated_hours_remaining': (self.budget - self.used_tokens) / tokens_per_hour if tokens_per_hour > 0 else float('inf')
        }
    
    def print_summary(self):
        """Print a summary of current usage"""
        stats = self.get_usage_stats()
        
        print("\n" + "="*50)
        print("📊 TOKEN USAGE SUMMARY")
        print("="*50)
        print(f"💰 Used: {stats['used_tokens']:,} / {stats['budget']:,} tokens")
        print(f"📈 Usage: {stats['usage_percentage']:.1f}%")
        print(f"🔄 Remaining: {stats['remaining']:,} tokens")
        print(f"⏱️  Session Duration: {stats['session_duration']}")
        print(f"🚀 Tokens/Hour: {stats['tokens_per_hour']:.1f}")
        
        if stats['estimated_hours_remaining'] != float('inf'):
            print(f"⏰ Estimated Hours Remaining: {stats['estimated_hours_remaining']:.1f}")
        else:
            print(f"⏰ Estimated Hours Remaining: ∞ (no usage yet)")
        
        # Recent activity
        if self.usage_history:
            print(f"\n📋 Recent Activity (last 5 requests):")
            for record in self.usage_history[-5:]:
                timestamp = datetime.fromisoformat(record['timestamp']).strftime("%H:%M:%S")
                print(f"  {timestamp}: +{record['tokens_used']} tokens - {record.get('description', 'Unknown')}")
        
        print("="*50)
    
    def reset_session(self):
        """Reset the current session"""
        self.used_tokens = 0
        self.session_start = datetime.now()
        self.usage_history = []
        self.save_usage()
        print("🔄 Token tracking session reset")
    
    def set_budget(self, new_budget: int):
        """Update the token budget"""
        self.budget = new_budget
        self.save_usage()
        print(f"💰 Token budget updated to {new_budget:,} tokens")

# Global tracker instance
tracker = None

def init_tracker(budget: int = 10000, alert_threshold: float = 0.8):
    """Initialize the global token tracker"""
    global tracker
    tracker = TokenTracker(budget, alert_threshold)
    return tracker

def track_tokens(tokens_used: int, url: str = "", description: str = ""):
    """Track token usage (global function)"""
    global tracker
    if tracker is None:
        tracker = init_tracker()
    
    tracker.track_request(tokens_used, url, description)
    return tracker.check_alerts()

def get_tracker() -> Optional[TokenTracker]:
    """Get the global tracker instance"""
    return tracker

def print_usage_summary():
    """Print usage summary (global function)"""
    global tracker
    if tracker:
        tracker.print_summary()
    else:
        print("⚠️  No token tracker initialized")

# Example usage
if __name__ == "__main__":
    # Initialize tracker with 10,000 token budget
    init_tracker(budget=10000, alert_threshold=0.8)
    
    # Simulate some usage
    track_tokens(150, "https://example.com/page1", "Scraping questions page 1")
    track_tokens(200, "https://example.com/page2", "Scraping questions page 2")
    track_tokens(300, "https://example.com/page3", "Scraping questions page 3")
    
    # Print summary
    print_usage_summary() 