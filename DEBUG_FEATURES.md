# Debug Features - Newsletter Editor

## 🐛 Enhanced Debug Console

The Newsletter Editor now includes a comprehensive debug console to help troubleshoot issues and monitor application behavior.

### Access Methods

1. **Floating Debug Button**: Click the 🐛 button in the bottom-right corner
2. **F12 Key**: Press F12 to toggle the debug console
3. **Keyboard Shortcut**: Press Ctrl+D to toggle the debug console

### Debug Console Features

#### 📊 **Log Filtering**
- Filter by log level: All, Errors, Warnings, Info, Debug, Success, API, User
- Real-time log count statistics
- Auto-scroll option for new logs

#### 📝 **Log Types**
- **ERROR**: Critical errors and exceptions
- **WARN**: Warning messages and potential issues
- **INFO**: General information about operations
- **DEBUG**: Detailed debugging information
- **SUCCESS**: Successful operations
- **API**: API calls and responses
- **USER**: User interactions and inputs

#### 🔧 **Debug Tools**
- **Test Button**: Generate sample logs for all types
- **Clear Button**: Clear all current logs
- **Download Button**: Export logs to a text file
- **Auto-scroll**: Automatically scroll to newest logs

#### 📱 **User Interaction Tracking**
- Button clicks (AI Assist, Add Image, Add Event)
- Text input changes (title, content)
- Template selections
- Tab navigation
- Modal opening/closing

### Current Debug Coverage

#### ✅ **Newsletter Editor Buttons**
All three main editor buttons are now fully functional with comprehensive logging:

1. **🤖 AI Assist**: Opens AI content generation modal
2. **🖼️ Add Image**: Opens image browser modal  
3. **📅 Add Event**: Adds event template to content

#### ✅ **State Changes**
- Newsletter loading/creation
- Content modifications
- Theme changes
- Save operations
- Error conditions

#### ✅ **API Operations**
- Newsletter CRUD operations
- AI service calls
- Image service requests
- Template operations

### Usage Examples

```javascript
// Manual logging in components
debugLogger.info('Operation started', { data: someData });
debugLogger.success('Operation completed successfully');
debugLogger.error('Operation failed', { error: errorMessage });
debugLogger.user('User clicked button', { buttonId: 'ai-assist' });
```

### Troubleshooting Guide

#### Common Issues & Solutions

1. **Buttons Not Working**
   - Open debug console (F12)
   - Click buttons and check for click events
   - Look for error messages in the logs

2. **Content Not Saving**
   - Check for save-related logs
   - Verify API connectivity in logs
   - Look for authentication errors

3. **AI/Image Features Not Working**
   - Check for service availability logs
   - Verify API key configuration messages
   - Look for network-related errors

#### Log Analysis Tips

- **Filter by ERROR**: Find critical issues first
- **Filter by USER**: Track user interaction flow
- **Filter by API**: Debug backend communication
- **Download logs**: Share with developers for support

### Development Notes

The debug system automatically captures:
- All console.log, console.error, console.warn, console.info calls
- Unhandled errors and promise rejections
- Component lifecycle events
- State updates and side effects

This enhanced debugging system makes it much easier to identify and resolve issues during development and testing.
