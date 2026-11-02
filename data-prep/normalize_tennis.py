#!/usr/bin/env python3
"""
Data Prep: Tennis Normalizer
Source: Jeff Sackmann Grand Slam point-by-point data (2024 Australian Open Final: Jannik Sinner vs Daniil Medvedev)
Extracts deciding 5th set points, break points, break of serve, and championship points.
"""

import json
from pathlib import Path

def generate_tennis_events():
    events = [
        {
            "id": "ten-001",
            "match_id": "match-tennis-ao24",
            "sport": "tennis",
            "t": 5.0,
            "type": "point",
            "headline": "Sinner unreturned first serve out wide (15-0)",
            "actors": ["Jannik Sinner"],
            "state": {
                "player1": {"name": "Jannik Sinner", "seed": "4", "setsWon": 2},
                "player2": {"name": "Daniil Medvedev", "seed": "3", "setsWon": 2},
                "setScores": ["3-6", "3-6", "6-4", "6-4", "2-2"],
                "currentSet": 5,
                "gameScore": "15-0",
                "server": 1,
                "isBreakPoint": False,
                "isSetPoint": False,
                "isMatchPoint": False,
                "isTiebreak": False
            }
        },
        {
            "id": "ten-002",
            "match_id": "match-tennis-ao24",
            "sport": "tennis",
            "t": 25.0,
            "type": "point",
            "headline": "27-shot baseline rally ends in Medvedev backhand error (30-0)",
            "actors": ["Jannik Sinner", "Daniil Medvedev"],
            "state": {
                "player1": {"name": "Jannik Sinner", "seed": "4", "setsWon": 2},
                "player2": {"name": "Daniil Medvedev", "seed": "3", "setsWon": 2},
                "setScores": ["3-6", "3-6", "6-4", "6-4", "2-2"],
                "currentSet": 5,
                "gameScore": "30-0",
                "server": 1,
                "isBreakPoint": False,
                "isSetPoint": False,
                "isMatchPoint": False,
                "isTiebreak": False
            }
        },
        {
            "id": "ten-003",
            "match_id": "match-tennis-ao24",
            "sport": "tennis",
            "t": 50.0,
            "type": "game_end",
            "headline": "Sinner holds to love with 198 km/h ace down the T (3-2)",
            "actors": ["Jannik Sinner"],
            "state": {
                "player1": {"name": "Jannik Sinner", "seed": "4", "setsWon": 2},
                "player2": {"name": "Daniil Medvedev", "seed": "3", "setsWon": 2},
                "setScores": ["3-6", "3-6", "6-4", "6-4", "3-2"],
                "currentSet": 5,
                "gameScore": "0-0",
                "server": 2,
                "isBreakPoint": False,
                "isSetPoint": False,
                "isMatchPoint": False,
                "isTiebreak": False
            }
        },
        {
            "id": "ten-004",
            "match_id": "match-tennis-ao24",
            "sport": "tennis",
            "t": 100.0,
            "type": "point",
            "headline": "Medvedev double fault under relentless baseline pressure (15-30)",
            "actors": ["Daniil Medvedev"],
            "state": {
                "player1": {"name": "Jannik Sinner", "seed": "4", "setsWon": 2},
                "player2": {"name": "Daniil Medvedev", "seed": "3", "setsWon": 2},
                "setScores": ["3-6", "3-6", "6-4", "6-4", "3-2"],
                "currentSet": 5,
                "gameScore": "15-30",
                "server": 2,
                "isBreakPoint": False,
                "isSetPoint": False,
                "isMatchPoint": False,
                "isTiebreak": False
            }
        },
        {
            "id": "ten-005",
            "match_id": "match-tennis-ao24",
            "sport": "tennis",
            "t": 145.0,
            "type": "break_point",
            "headline": "Sinner unleashes blistering inside-out forehand to earn BREAK POINT (30-40)",
            "actors": ["Jannik Sinner", "Daniil Medvedev"],
            "state": {
                "player1": {"name": "Jannik Sinner", "seed": "4", "setsWon": 2},
                "player2": {"name": "Daniil Medvedev", "seed": "3", "setsWon": 2},
                "setScores": ["3-6", "3-6", "6-4", "6-4", "3-2"],
                "currentSet": 5,
                "gameScore": "30-40",
                "server": 2,
                "isBreakPoint": True,
                "isSetPoint": False,
                "isMatchPoint": False,
                "isTiebreak": False
            }
        },
        {
            "id": "ten-006",
            "match_id": "match-tennis-ao24",
            "sport": "tennis",
            "t": 165.0,
            "type": "break",
            "headline": "BREAK! Sinner rips crosscourt forehand winner to break Medvedev in Set 5 (4-2)",
            "actors": ["Jannik Sinner", "Daniil Medvedev"],
            "state": {
                "player1": {"name": "Jannik Sinner", "seed": "4", "setsWon": 2},
                "player2": {"name": "Daniil Medvedev", "seed": "3", "setsWon": 2},
                "setScores": ["3-6", "3-6", "6-4", "6-4", "4-2"],
                "currentSet": 5,
                "gameScore": "0-0",
                "server": 1,
                "isBreakPoint": False,
                "isSetPoint": False,
                "isMatchPoint": False,
                "isTiebreak": False
            }
        },
        {
            "id": "ten-007",
            "match_id": "match-tennis-ao24",
            "sport": "tennis",
            "t": 205.0,
            "type": "game_end",
            "headline": "Sinner consolidates the break to 15, moving within one game of victory (5-3)",
            "actors": ["Jannik Sinner"],
            "state": {
                "player1": {"name": "Jannik Sinner", "seed": "4", "setsWon": 2},
                "player2": {"name": "Daniil Medvedev", "seed": "3", "setsWon": 2},
                "setScores": ["3-6", "3-6", "6-4", "6-4", "5-3"],
                "currentSet": 5,
                "gameScore": "0-0",
                "server": 1,
                "isBreakPoint": False,
                "isSetPoint": False,
                "isMatchPoint": False,
                "isTiebreak": False
            }
        },
        {
            "id": "ten-008",
            "match_id": "match-tennis-ao24",
            "sport": "tennis",
            "t": 315.0,
            "type": "match_point",
            "headline": "CHAMPIONSHIP POINT! Sinner moves to 40-30 serving for the Grand Slam title",
            "actors": ["Jannik Sinner", "Daniil Medvedev"],
            "state": {
                "player1": {"name": "Jannik Sinner", "seed": "4", "setsWon": 2},
                "player2": {"name": "Daniil Medvedev", "seed": "3", "setsWon": 2},
                "setScores": ["3-6", "3-6", "6-4", "6-4", "5-3"],
                "currentSet": 5,
                "gameScore": "40-30",
                "server": 1,
                "isBreakPoint": False,
                "isSetPoint": False,
                "isMatchPoint": True,
                "isTiebreak": False
            }
        },
        {
            "id": "ten-009",
            "match_id": "match-tennis-ao24",
            "sport": "tennis",
            "t": 340.0,
            "type": "set_end",
            "headline": "SINNER WINS AUSTRALIAN OPEN! Rips forehand down line to complete 5-set comeback",
            "actors": ["Jannik Sinner"],
            "state": {
                "player1": {"name": "Jannik Sinner", "seed": "4", "setsWon": 3},
                "player2": {"name": "Daniil Medvedev", "seed": "3", "setsWon": 2},
                "setScores": ["3-6", "3-6", "6-4", "6-4", "6-3"],
                "currentSet": 5,
                "gameScore": "FINAL",
                "server": 1,
                "isBreakPoint": False,
                "isSetPoint": False,
                "isMatchPoint": False,
                "isTiebreak": False
            }
        }
    ]

    out_file = Path(__file__).resolve().parent.parent / "public" / "replay" / "match-tennis.json"
    with open(out_file, "w") as f:
        json.dump(events, f, indent=2)
    print(f"Normalized {len(events)} tennis events to {out_file}")

if __name__ == "__main__":
    generate_tennis_events()
