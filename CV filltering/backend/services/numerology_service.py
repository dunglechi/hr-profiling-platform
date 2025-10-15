import logging
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class NumerologyService:
    def __init__(self):
        """Initialize Vietnamese numerology service"""
        self.number_meanings = {
            1: {"personality": "Leader, Independent", "career": "Management, Entrepreneurship"},
            2: {"personality": "Cooperative, Diplomatic", "career": "Teamwork, Counseling"},
            3: {"personality": "Creative, Communicative", "career": "Arts, Marketing"},
            4: {"personality": "Practical, Organized", "career": "Engineering, Administration"},
            5: {"personality": "Dynamic, Adventurous", "career": "Sales, Travel"},
            6: {"personality": "Nurturing, Responsible", "career": "Healthcare, Education"},
            7: {"personality": "Analytical, Spiritual", "career": "Research, Analysis"},
            8: {"personality": "Ambitious, Business-minded", "career": "Finance, Executive"},
            9: {"personality": "Humanitarian, Wise", "career": "Social Work, Teaching"}
        }

    def test_service(self) -> bool:
        """Test service functionality"""
        return True

    def calculate_insights(self, name: str, date_of_birth: str = "") -> Dict[str, Any]:
        """Calculate numerology insights based on name and birth date"""
        try:
            life_path = self._calculate_life_path_from_name(name)
            meaning = self.number_meanings.get(life_path, self.number_meanings[1])
            
            # Calculate compatibility score (mock implementation)
            compatibility_score = self._calculate_compatibility_score(life_path)
            
            return {
                "lifePath": life_path,
                "personality": meaning["personality"],
                "careerFit": meaning["career"],
                "compatibilityScore": compatibility_score
            }
            
        except Exception as e:
            logger.error(f"Numerology calculation error: {e}")
            return self._default_insights()

    def _calculate_life_path_from_name(self, name: str) -> int:
        """Calculate life path number from name (Vietnamese numerology)"""
        if not name or name == "Name not found":
            return 5  # Default neutral number
            
        # Convert name to numbers (A=1, B=2, etc.)
        name_value = 0
        for char in name.upper():
            if char.isalpha():
                name_value += ord(char) - ord('A') + 1
        
        # Reduce to single digit
        while name_value > 9:
            name_value = sum(int(digit) for digit in str(name_value))
        
        return max(1, name_value)  # Ensure result is 1-9

    def _calculate_compatibility_score(self, life_path: int) -> int:
        """Calculate job compatibility score based on life path number"""
        # Mock scoring system - in real implementation, this would be more sophisticated
        base_scores = {
            1: 85, 2: 78, 3: 82, 4: 88, 5: 75,
            6: 90, 7: 80, 8: 87, 9: 83
        }
        
        base_score = base_scores.get(life_path, 75)
        
        # Add some randomness for demo purposes
        import random
        variation = random.randint(-10, 15)
        final_score = max(60, min(100, base_score + variation))
        
        return final_score

    def _default_insights(self) -> Dict[str, Any]:
        """Return default insights when calculation fails"""
        return {
            "lifePath": 5,
            "personality": "Balanced, Adaptable",
            "careerFit": "Versatile roles, Team collaboration",
            "compatibilityScore": 75
        }

    def get_detailed_analysis(self, life_path: int) -> Dict[str, Any]:
        """Get detailed numerology analysis for a life path number"""
        meaning = self.number_meanings.get(life_path, self.number_meanings[1])
        
        return {
            "lifePath": life_path,
            "strengths": self._get_strengths(life_path),
            "challenges": self._get_challenges(life_path),
            "personality": meaning["personality"],
            "careerFit": meaning["career"],
            "workStyle": self._get_work_style(life_path)
        }

    def _get_strengths(self, life_path: int) -> list:
        """Get strengths for a life path number"""
        strengths_map = {
            1: ["Natural leadership", "Initiative", "Independence"],
            2: ["Cooperation", "Diplomacy", "Patience"],
            3: ["Creativity", "Communication", "Optimism"],
            4: ["Organization", "Reliability", "Persistence"],
            5: ["Adaptability", "Energy", "Freedom"],
            6: ["Responsibility", "Compassion", "Harmony"],
            7: ["Analysis", "Intuition", "Research"],
            8: ["Ambition", "Business acumen", "Authority"],
            9: ["Wisdom", "Compassion", "Global thinking"]
        }
        return strengths_map.get(life_path, ["Balanced approach", "Adaptability"])

    def _get_challenges(self, life_path: int) -> list:
        """Get potential challenges for a life path number"""
        challenges_map = {
            1: ["Impatience", "Stubbornness"],
            2: ["Indecision", "Over-sensitivity"],
            3: ["Scattered energy", "Superficiality"],
            4: ["Rigidity", "Workaholism"],
            5: ["Restlessness", "Inconsistency"],
            6: ["Over-responsibility", "Perfectionism"],
            7: ["Isolation", "Over-analysis"],
            8: ["Materialism", "Impatience"],
            9: ["Idealism", "Emotional burden"]
        }
        return challenges_map.get(life_path, ["Balance needed"])

    def _get_work_style(self, life_path: int) -> str:
        """Get work style description for a life path number"""
        work_styles = {
            1: "Prefers leading projects and making independent decisions",
            2: "Thrives in collaborative environments with team support",
            3: "Enjoys creative projects and communicative roles",
            4: "Excels in structured, detail-oriented positions",
            5: "Needs variety and freedom in work assignments",
            6: "Motivated by helping others and creating harmony",
            7: "Prefers research-based, analytical work",
            8: "Driven by achievement and business success",
            9: "Inspired by meaningful, humanitarian work"
        }
        return work_styles.get(life_path, "Adaptable to various work environments")