# Claude Code Sound Notifications Setup

## Quick Setup (Copy-Paste Solution)

### 1. System-Wide Configuration (One-Time Setup)

Create or update the file `~/.claude/settings.json` with:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "afplay /System/Library/Sounds/Funk.aiff"
          }
        ]
      }
    ],
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "afplay /System/Library/Sounds/Purr.aiff"
          }
        ]
      }
    ]
  },
  "permissions": {
    "allow": [
      "Bash(afplay:*)"
    ]
  }
}
```

This configuration will apply to ALL Claude Code sessions across ALL projects on this computer.

### 2. Project-Specific Override (Optional)

If you want different sounds for a specific project, create `.claude/settings.local.json` in the project root:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "afplay /System/Library/Sounds/Glass.aiff"
          }
        ]
      }
    ]
  },
  "permissions": {
    "allow": [
      "Bash(afplay:*)"
    ]
  }
}
```

## How It Works

- **Stop Hook**: Triggers when Claude Code finishes responding (plays Funk.aiff)
- **Notification Hook**: Triggers for notifications (plays Purr.aiff)
- **Permissions**: Allows Claude Code to run `afplay` command without asking for approval

## Available macOS System Sounds

Located in `/System/Library/Sounds/`:
- Basso.aiff
- Blow.aiff
- Bottle.aiff
- Frog.aiff
- Funk.aiff (default for Stop)
- Glass.aiff
- Hero.aiff
- Morse.aiff
- Ping.aiff
- Pop.aiff
- Purr.aiff (default for Notification)
- Sosumi.aiff
- Submarine.aiff
- Tink.aiff

## Configuration File Priority

Claude Code checks settings in this order (later overrides earlier):
1. `~/.claude/settings.json` (user-wide settings)
2. `.claude/settings.json` (project settings, committed to git)
3. `.claude/settings.local.json` (local project settings, not committed)

## Verification

To verify your setup is working:
1. Ask Claude Code to do any task
2. You should hear the Funk sound when Claude finishes responding
3. The permission for `afplay` should be automatically granted (no approval needed)

## Troubleshooting

If sounds aren't playing:
1. Check volume is not muted
2. Verify the settings file exists: `ls -la ~/.claude/settings.json`
3. Ensure proper JSON formatting (use a JSON validator)
4. Check that the sound file path exists: `ls /System/Library/Sounds/`

## Alternative Custom Sounds

To use custom sounds, replace the command with your audio file path:
```json
"command": "afplay /path/to/your/sound.mp3"
```

Supported formats: .aiff, .wav, .mp3, .m4a